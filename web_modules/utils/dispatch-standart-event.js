export default function dispatchStdEvent(stdEventName, bubbles, cancelable, element) {
  var newStdEvent
  if (bubbles === undefined || bubbles === null) {
    bubbles = true
  }
  if (cancelable === undefined || cancelable === null) {
    cancelable = true
  }
  try {
    newStdEvent = new Event(stdEventName, {"bubbles": bubbles, "cancelable": cancelable})
  }
  catch (e) {
    newStdEvent = document.createEvent("Event");
    newStdEvent.initEvent(stdEventName, bubbles, cancelable);
  }
  (element || window).dispatchEvent(newStdEvent)
}
