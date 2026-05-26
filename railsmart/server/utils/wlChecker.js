const Train = require('../models/Train')
const WLAlert = require('../models/WLAlert')

// Simulate WL change
// In real app this would call IRCTC API
const simulateWLChange = (currentWL, currentChance) => {
  const random = Math.random()

  // 40% chance WL improves
  if (random < 0.4 && currentWL > 0) {
    const improvement = Math.floor(Math.random() * 3) + 1
    const newWL = Math.max(0, currentWL - improvement)
    const newChance = Math.min(99, currentChance + Math.floor(Math.random() * 8) + 2)
    return { wlNumber: newWL, confirmChance: newChance }
  }

  // 20% chance WL worsens
  if (random > 0.8) {
    const worsening = Math.floor(Math.random() * 2) + 1
    const newWL = currentWL + worsening
    const newChance = Math.max(10, currentChance - Math.floor(Math.random() * 5))
    return { wlNumber: newWL, confirmChance: newChance }
  }

  // 40% chance no change
  return { wlNumber: currentWL, confirmChance: currentChance }
}

// Main checker function — runs periodically
const checkAllWLAlerts = async () => {
  try {
    console.log('🔍 WL Checker running at:', new Date().toLocaleTimeString())

    // Get all active alerts
    const activeAlerts = await WLAlert.find({ alertStatus: 'ACTIVE' })

    if (activeAlerts.length === 0) {
      console.log('No active WL alerts to check')
      return
    }

    console.log(`Checking ${activeAlerts.length} active alerts...`)

    for (const alert of activeAlerts) {
      // Simulate WL change
      const { wlNumber, confirmChance } = simulateWLChange(
        alert.currentWLNumber,
        alert.currentConfirmChance
      )

      // Add to history
      alert.history.push({
        wlNumber,
        confirmChance,
        checkedAt: new Date()
      })

      // Keep only last 20 history entries
      if (alert.history.length > 20) {
        alert.history = alert.history.slice(-20)
      }

      // Update current values
      const previousChance = alert.currentConfirmChance
      alert.currentWLNumber = wlNumber
      alert.currentConfirmChance = confirmChance
      alert.lastChecked = new Date()

      // Check if alert should trigger
      if (confirmChance >= alert.triggerWhenChanceAbove) {
        alert.alertStatus = 'TRIGGERED'
        console.log(`✅ Alert TRIGGERED for user ${alert.user} — ${alert.trainName} — ${confirmChance}% chance`)
      }

      // Check if WL confirmed (WL = 0 means confirmed)
      if (wlNumber === 0) {
        alert.alertStatus = 'TRIGGERED'
        console.log(`🎉 WL CONFIRMED for user ${alert.user} — ${alert.trainName}`)
      }

      // Check if journey date has passed
      if (new Date() > new Date(alert.journeyDate)) {
        alert.alertStatus = 'EXPIRED'
        console.log(`⏰ Alert EXPIRED for ${alert.trainName}`)
      }

      await alert.save()

      // Log improvement
      if (confirmChance > previousChance) {
        console.log(`📈 ${alert.trainName} (${alert.selectedClass}): WL ${alert.currentWLNumber} → Chance ${confirmChance}%`)
      }
    }

    console.log('✅ WL check complete')

  } catch (error) {
    console.log('WL Checker error:', error.message)
  }
}

module.exports = { checkAllWLAlerts, simulateWLChange }