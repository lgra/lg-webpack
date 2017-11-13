require("shared/index.css")
require("./radio.css")

import React, { Component } from "react"
import cx from "classnames"

import Radio from "./radio"
import dispatchCustomEvent from "utils/dispatch-custom-event"

var salt = 0

import shouldUpdate from "utils/should-update-decorator"

@shouldUpdate()
export default class RadioGroup extends Component {

  constructor(props) {
    super(props)
    this.state = {
      name: RadioGroup + (++salt),
    }
  }

  render() {
    var { className, children, value, disabled, onChange, ...other } = this.props
    return (
      <span ref="item" className={cx("ui-control ui-radio-group", className)} {...other}>
        { React.Children.map(children, function(child, idx) {
            if (child && child.type === Radio) {
              return React.cloneElement(child, {
                name: this.state.name,
                checked: value === child.props.value,
                disabled: disabled || child.props.disabled,
                onChange: onChange || child.props.onChange
              })
            }
            else {
              return child
            }
          }.bind(this))
        }
      </span>
    )
  }

  focus() {
    dispatchCustomEvent(this.state.name + "Event", { action: "focus" })
  }

  scrollIntoView(alignWithTop) {
    this.refs.item.scrollIntoView(alignWithTop)
  }

}
