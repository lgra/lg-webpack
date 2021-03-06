require("./index.html") // dist/index.html

import React from 'react'
import ReactDOM from 'react-dom'

import { AppContainer } from 'react-hot-loader'

import App from "app"
import Group from "app/group"

ReactDOM.render((
  <AppContainer>
    <App>
      <Group label="option" nbr={6} />
      <Group label="other" nbr={4} />
    </App>
  </AppContainer>
), document.querySelector(".theApp"))

if (module.hot) {
  module.hot.accept()
}
