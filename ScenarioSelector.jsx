import PropTypes from 'prop-types';
import React from 'react';

import { SCENARIO_DEFINITIONS } from './scenarios';

import { selectionList } from './style/SettingsPane.scss';

export default class ScenarioSelector extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { textValue: this.props.value };
  }

  render() {
    const onChange = (event) => {
      if (event.target.value == '') {
        this.setState({ textValue: event.target.value });
        return;
      }

      let value = parseInt(event.target.value);
      if (isNaN(value) || value < 0) {
        value = 0;
      } else if (value >= SCENARIO_DEFINITIONS.length) {
        value = SCENARIO_DEFINITIONS.length;
      }
      this.setState({ textValue: value });

      this.props.onChange(value);
    };
    
    const handleFocus = (event) => event.target.select();

    return (
      <ul className={selectionList}>
      <li>{this.props.text}</li>
      <input
      name="scenario_number"
      type="text"
      pattern="[0-9]*"
      inputmode="numeric"
      value={this.state.textValue}
      onChange={onChange}
      onFocus={handleFocus}
      />
      </ul>
    );
  }
}

