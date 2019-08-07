import React from 'react';

import LevelSelector from './LevelSelector';
import ScenarioSelector from './ScenarioSelector';
import { makeDeckSpec } from './cards';
import { SCENARIO_DEFINITIONS, SPECIAL_RULES } from './scenarios';

import { selectionList } from './style/SettingsPane.scss';

export default class ScenarioList extends React.Component {
  state = { level: 1, scenario: 1 };

  getScenarioDecks() {
    const { decks, special_rules: specialRules = [] } = SCENARIO_DEFINITIONS[this.state.scenario - 1];
    return decks.map(({ name }) => {
      let level = this.state.level;
      if ((specialRules.indexOf(SPECIAL_RULES.living_corpse_two_levels_extra) >= 0) && (name == SPECIAL_RULES.living_corpse_two_levels_extra.affected_deck)) {
        level = Math.min(7, (this.state.level + parseInt(SPECIAL_RULES.living_corpse_two_levels_extra.extra_levels)));
      }
      return makeDeckSpec(name, level);
    });
  }

  handleLevelChange = (level) => {
    this.setState({ level });
  }

  handleScenarioChange = (scenario) => {
    this.setState({ scenario });
  }

  render() {
    return (
      <ul className={selectionList}>
        <LevelSelector
          inline={false}
          text="Select level"
          value={this.state.level}
          onChange={this.handleLevelChange}
        />
        <ScenarioSelector
          text="Select scenario number"
          value={this.state.scenario}
          onChange={this.handleScenarioChange}
        />
      </ul>
    );
  }
}
