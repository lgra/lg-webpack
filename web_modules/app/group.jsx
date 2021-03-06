require("./index.css")

import React from 'react'
import ReactDOM from 'react-dom'

import RadioGroup from "forms/radiogroup"
import Radio from "forms/radio"

import shouldUpdate from "utils/should-update-decorator"
import renderDuration from "utils/render-duration-decorator"

@renderDuration
@shouldUpdate()
export default class Group extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      value: 1,
    }
  }

  render() {
    var { label, nbr, ...other } = this.props
    return (
      <RadioGroup onChange={(value) => { this.setState({ value: value }) }} value={this.state.value} >
        {
          'x'.repeat(nbr - 1).split('x').map((v, i) => <Radio key={i} value={i + 1} label={label + " " + (i + 1)} />)
        }
        <span className="group-current-value" >{"current value is " + this.state.value}</span>
      </RadioGroup>
    )
  }

}