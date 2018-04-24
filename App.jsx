import React from 'react';

import SettingsPane from './SettingsPane';
import Tableau from './Tableau';
import firebase, { useFirebase } from './firebase';

import * as css from './style/Card.scss';

// This should be dynamic dependant on lines per card
function refresh_ui() {
  const actual_card_height = 296;
  const base_font_size = 26.6;

  const tableau = document.getElementById('tableau');
  const cards = tableau.getElementsByClassName(css.card);
  for (let i = 1; i < cards.length; i += 1) {
    if (cards[i].className.indexOf(css.ability) !== -1) {
      const scale = cards[i].getBoundingClientRect().height / actual_card_height;
      const scaled_font_size = base_font_size * scale;

      const font_pixel_size = Math.min(scaled_font_size, base_font_size);
      tableau.style.fontSize = `${font_pixel_size}px`;
      break;
    }
  }
}

export default class App extends React.Component {
  state = {
    modDeckHidden: true,
    selectedDeckNames: [],
  }

  componentDidMount() {
    if (useFirebase) {
      this.selectedDecksRef = firebase.database().ref('selected_decks');
      this.selectedDecksRef.on('value', this.onSelectedDecksChange, this);
      this.modDeckHiddenRef = firebase.database().ref('mod_deck_hidden');
      this.modDeckHiddenRef.on('value', this.onModDeckHiddenChange, this);
    }
    refresh_ui();
    window.addEventListener('resize', refresh_ui);
  }

  componentWillUnmount() {
    if (useFirebase) {
      this.selectedDecksRef.off('value', this.onSelectedDecksChange, this);
      this.modDeckHiddenRef.off('value', this.onModDeckHiddenChange, this);
    }
    window.removeEventListener('resize', refresh_ui);
  }

  onModDeckHiddenChange(snapshot) {
    let modDeckHidden = snapshot.val();
    if (typeof modDeckHidden !== 'boolean') {
      modDeckHidden = true;
    }
    this.setState({ modDeckHidden });
  }

  onSelectedDecksChange(snapshot) {
    this.setState({ selectedDeckNames: snapshot.val() || [] });
  }

  tableau = React.createRef();

  handleSelectDecks = (selectedDeckNames, showModifierDeck, preserve) => {
    if (useFirebase) {
      let future = Promise.resolve(null);
      if (!preserve) {
        future = firebase.database().ref().remove();
      }
      future
        .then(() => this.selectedDecksRef.set(selectedDeckNames))
        .then(() => this.modDeckHiddenRef.set(!showModifierDeck));
    } else {
      this.setState({
        modDeckHidden: !showModifierDeck,
        selectedDeckNames,
      });
      if (!preserve) {
        this.tableau.current.reset();
      }
    }
  }

  render() {
    const deckSpecs = this.state.selectedDeckNames.map(d => ({
      id: (d.name || d.class).replace(/\s+/g, ''),
      name: d.name || d.class,
      class: d.class,
      level: d.level,
    }));

    return (
      <React.Fragment>
        <div id="panecontainer" className="panecontainer">
          <SettingsPane onSelectDecks={this.handleSelectDecks} />
        </div>
        <div>
          <div id="settingsbtncontainer" />
          <div id="currentdecks">
            <ul id="currentdeckslist" className="currentdeckslist" />
          </div>
        </div>
        <div id="tableau" style={{ fontSize: '26.6px' }}>
          <Tableau
            deckSpecs={deckSpecs}
            modDeckHidden={this.state.modDeckHidden}
            ref={this.tableau}
            useFirebase={useFirebase}
          />
        </div>
      </React.Fragment>
    );
  }
}
