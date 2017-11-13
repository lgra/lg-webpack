require("./index.css")

import React from 'react'
import ReactDOM from 'react-dom'

import Group from "./group"

import renderDuration from "utils/render-duration-decorator"

@renderDuration
export default class App extends React.Component {

  render() {
    var i = 0
    var display = React.Children.toArray(this.props.children).reduce((prev, child) => {
      if (child.type === Group) {
        prev.push(<br key={"br" + (++i)} />)
      }
      prev.push(child)
      return prev
    }, [])
    return (
      <div>
        <button onClick={() => this.forceUpdate()} >Refresh</button>
        {display}
      </div>
    )
  }

}