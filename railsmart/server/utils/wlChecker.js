const Train = require('../models/Train')
const WLAlert = require('../models/WLAlert')
const Notification = require('../models/Notification')

// Simulate WL change
const simulateWLChange = (currentWL, currentChance) => {
  const random = Math.random()

  if (random < 0.4 && currentWL > 0) {
    const improvement = Math.floor(Math.random() * 3) + 1
    const newWL = Math.max(0, currentWL - improvement)
    const newChance = Math.min(99, currentChance + Math.floor(Math.random() * 8) + 2)
    return { wlNumber: newWL, confirmChance: newChance }
  }

  if (random > 0.8) {
    const worsening = Math.floor(Math.random() * 2) + 1
    const newWL = currentWL + worsening
    const newChance = Math.max(10, currentChance - Math.floor(Math.random() * 5))
    return { wlNumber: newWL, confirmChance: newChance }
  }

  return { wlNumber: currentWL, confirmChance: currentChance }
}

// Get hours until journey
const getHoursUntilJourney = (journeyDate) => {
  const now = new Date()
  const journey = new Date(journeyDate)
  const diffMs = journey - now
  return diffMs / (1000 * 60 * 60)
}

// Create notification for user
const createNotification = async (alert, type, title, message) => {
  try {
    // Check if same notification already exists in last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
    const existing = await Notification.findOne({
      user: alert.user,
      alertId: alert._id,
      type,
      createdAt: { $gte: sixHoursAgo }
    })

    // Don't create duplicate notifications
    if (existing) return

    await Notification.create({
      user: alert.user,
      type,
      title,
      message,
      trainName: alert.trainName,
      trainNumber: alert.trainNumber,
      selectedClass: alert.selectedClass,
      currentWLNumber: alert.currentWLNumber,
      currentConfirmChance: alert.currentConfirmChance,
      alertId: alert._id
    })

    console.log(`🔔 Notification created: ${type} for ${alert.trainName}`)

  } catch (error) {
    console.log('Error creating notification:', error.message)
  }
}

// Main checker function
const checkAllWLAlerts = async () => {
  try {
    console.log('🔍 WL Checker running at:', new Date().toLocaleTimeString())

    const activeAlerts = await WLAlert.find({ alertStatus: 'ACTIVE' })

    if (activeAlerts.length === 0) {
      console.log('No active WL alerts to check')
      return
    }

    console.log(`Checking ${activeAlerts.length} active alerts...`)

    for (const alert of activeAlerts) {

      const { wlNumber, confirmChance } = simulateWLChange(
        alert.currentWLNumber,
        alert.currentConfirmChance
      )

      const previousChance = alert.currentConfirmChance
      const hoursUntilJourney = getHoursUntilJourney(alert.journeyDate)

      // Add to history
      alert.history.push({
        wlNumber,
        confirmChance,
        checkedAt: new Date()
      })

      if (alert.history.length > 20) {
        alert.history = alert.history.slice(-20)
      }

      alert.currentWLNumber = wlNumber
      alert.currentConfirmChance = confirmChance
      alert.lastChecked = new Date()

      // ─────────────────────────────────────────
      // SMART NOTIFICATION LOGIC
      // ─────────────────────────────────────────

      // CRITICAL — Below 30% AND within 24 hours
      if (confirmChance < 30 && hoursUntilJourney <= 24 && hoursUntilJourney > 0) {
        await createNotification(
          alert,
          'CRITICAL',
          `🚨 Critical: ${alert.trainName} WL unlikely to confirm`,
          `Your WL ticket for ${alert.trainName} (${alert.selectedClass}) has only ${confirmChance}% confirmation chance. Chart prepares in ${Math.floor(hoursUntilJourney)} hours. Cancel NOW for full refund or you may lose cancellation charges!`
        )
        alert.alertStatus = 'TRIGGERED'
      }

      // URGENT — Below 50% AND within 48 hours
      else if (confirmChance < 50 && hoursUntilJourney <= 48 && hoursUntilJourney > 0) {
        await createNotification(
          alert,
          'URGENT',
          `⚠️ Urgent: ${alert.trainName} WL not improving`,
          `Your WL ticket for ${alert.trainName} (${alert.selectedClass}) has ${confirmChance}% confirmation chance with ${Math.floor(hoursUntilJourney)} hours until departure. Consider cancelling or finding alternate routes to avoid losing money!`
        )
      }

      // WARNING — No improvement for long time
      else if (confirmChance < 50 && previousChance >= confirmChance) {
        // Only warn if chance has been stagnant or dropping
        const noImprovementFor = alert.history.length >= 5
          ? alert.history.slice(-5).every(h => h.confirmChance <= alert.initialConfirmChance + 10)
          : false

        if (noImprovementFor) {
          await createNotification(
            alert,
            'WARNING',
            `📉 Warning: ${alert.trainName} WL not moving`,
            `Your WL ticket for ${alert.trainName} (${alert.selectedClass}) confirmation chance is stuck at ${confirmChance}%. Consider looking at alternate routes as backup plan.`
          )
        }
      }

      // Journey passed — expire alert
      if (hoursUntilJourney <= 0) {
        alert.alertStatus = 'EXPIRED'
        console.log(`⏰ Alert EXPIRED for ${alert.trainName}`)
      }

      await alert.save()
    }

    console.log('✅ WL check complete')

  } catch (error) {
    console.log('WL Checker error:', error.message)
  }
}

module.exports = { checkAllWLAlerts, simulateWLChange }