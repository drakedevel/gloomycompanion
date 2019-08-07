import PropTypes from 'prop-types';
import React from 'react';

import { selectionList } from './style/SettingsPane.scss';

const MAX_LEVEL = 7;

export default class LevelSelector extends React.Component {
  static propTypes = {
    inline: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { textValue: this.props.value };
  }

  render() {
    const Wrapper = this.props.inline ? 'span' : 'ul';
    const Label = this.props.inline ? 'label' : 'li';

    const onChange = (event) => {
      if (event.target.value == '') {
        this.setState({ textValue: event.target.value });
        return;
      }

      // We take the value mod 10, so that we can make the latest entered digit override
      // the field value
      let value = parseInt(event.target.value) % 10;
      if (Number.isNaN(value) || value < 0) {
        value = 0;
      } else if (value > MAX_LEVEL) {
        value = MAX_LEVEL;
      }
      this.setState({ textValue: value });

      this.props.onChange(value);
    };

    const handleFocus = event => event.target.select();

    return (
      <Wrapper className={selectionList}>
        <Label>{this.props.text}</Label>
        <input
          name="scenario_level"
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          value={this.state.textValue}
          onChange={onChange}
          onFocus={handleFocus}
        />
      </Wrapper>
    );
  }
}
