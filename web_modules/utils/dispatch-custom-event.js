export default function dispatchCustomEvent(customEventName, detail) {
  var newCustomEvent
  try {
    newCustomEvent = new CustomEvent(customEventName, { detail: detail})
  }
  catch (e) {
    newCustomEvent = document.createEvent("Event")
    newCustomEvent.initEvent(customEventName, true, true)
    newCustomEvent.detail = detail
  }
  window.dispatchEvent(newCustomEvent)
}
