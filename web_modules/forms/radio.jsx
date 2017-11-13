/*
    onChange: PropTypes.func, // void function ()
    checked: PropTypes.bool, // svg content after button label is half size large
    value: PropTypes.any,
    icon: PropTypes.string, // svg content before button label
    label: PropTypes.string, // button label
    title: PropTypes.string, // button title, defaulted to button label
    disabled: PropTypes.bool,
    highlighted: PropTypes.bool,
    className: PropTypes.string,
*/

require("shared/index.css")
require("./radio.css")

import React, { Component } from "react"
import cx from "classnames"

import Icon from "icon"

var salt = 0

import shouldUpdate from "utils/should-update-decorator"

@shouldUpdate()
export default class Radio extends Component {

  constructor(props) {
    super(props)
    this.state = {
      salt: salt++
    }
    this.listenFocusEvent = this.listenFocusEvent.bind(this)
  }

  componentDidMount() {
    window.addEventListener(this.props.name + "Event", this.listenFocusEvent, false)
  }
  componentWillUnmount() {
    window.removeEventListener(this.props.name + "Event", this.listenFocusEvent, false)
  }

  listenFocusEvent(e) {
    if (e.detail && e.detail.action === "focus") {
      if (this.props.checked) {
        this.focus()
      }
    }
  }

  render() {
    var { className, highlighted, title, icon, label, type, id, name, checked, disabled, onChange, children, ...other } = this.props
    var cssClass = cx(
      "ui-control",
      "ui-radio",
      {
        "ui-radio--highlighted": highlighted,
      },
      className
    )
    return (
      <span className={cssClass} {...other} >
        <input ref="input" type="radio" id={"VrRadio" + this.state.salt} name={name} checked={checked}
          className="ui-radio-input" onChange={() => this.handleChange()} disabled={disabled} />
        <label ref="label" className="ui-radio-label" htmlFor={"VrRadio" + this.state.salt} title={title} >
          <Icon svg={checked ? require("shared/icons/option-on.svg") : require("shared/icons/option-off.svg")} className="ui-radio-img" />
          {Boolean(children || label) && <span className="ui-radio-text">{children || label}</span>}
        </label>
      </span>
    )
  }

  handleChange() {
    if (this.props.onChange) {
      this.props.onChange(this.props.value)
    }
  }

  click() {
    this.refs.input.click()
  }
  focus() {
    this.refs.label.focus()
  }
  blur() {
    this.refs.label.blur()
  }
  scrollIntoView(alignWithTop) {
    this.refs.label.scrollIntoView(alignWithTop)
  }

}
