import PropTypes from 'prop-types';
import React from 'react';
import { CARD_TYPES_MODIFIER, MODIFIER_CARDS, MODIFIER_DECK } from './modifiers';
import { shuffle_list } from './util';

import * as css from './style/Card.scss';

function define_modifier_card(card_definition) {
  const card = {
    card_image: card_definition.image,
    card_type: card_definition.type,
    shuffle_next_round: card_definition.shuffle,
    toJSON: () => ({
      card_type: card.card_type,
      shuffle_next_round: card.shuffle_next_round,
    }),
  };

  return card;
}

export default class ModifierDeckState {
  constructor(draw_pile, discard, num_special, needs_shuffled, advantage_card) {
    this.draw_pile = draw_pile;
    this.discard = discard;
    this.num_special = num_special;
    this.needs_shuffled = needs_shuffled;
    this.advantage_card = advantage_card;
  }

  static create(storageState) {
    // FIXME: Get these from storage
    const draw_pile = [];
    const discard = [];
    let needs_shuffled = false;
    let num_special = { 'bless': 0, 'curse': 0 };
    let advantage_card = null;

    MODIFIER_DECK.forEach((card_definition) => {
      const card = define_modifier_card(card_definition);
      draw_pile.push(card);
    });

    return new ModifierDeckState(draw_pile, discard, num_special, needs_shuffled, advantage_card);
  }

  mustReshuffle() {
    return !this.draw_pile.length;
  }

  draw_card() {
    if (this.mustReshuffle()) {
      return this.reshuffle();
    } else {
      const drewCard = this.draw_pile[0];
      const num_special = {...this.num_special};
      const discard = [...this.discard];
      if (drewCard.card_type == 'bless' || drewCard.card_type == 'curse') {
        // Remove bless and curses as we draw them
        num_special[drewCard.card_type] -= 1;
      }

      discard.unshift(drewCard);

      let needs_shuffled = this.needs_shuffled || drewCard.shuffle_next_round;
      return new ModifierDeckState(this.draw_pile.slice(1), discard,
          num_special, needs_shuffled);
    }
  }

  draw_two_cards() {
    let deck = this;
    // reshuffle if we need to
    if (this.draw_pile.length == 0) {
      deck = deck.reshuffle();
    }

    let advantage_card;

    // If there was 1 card in draw_pile when we clicked "draw 2".
    // we should draw, save that card, reshuffle, and draw the next
    if (deck.draw_pile.length == 1) {
      deck = deck.draw_card();
      // Take advantage card out of the discard, so it doesn't get shuffled back in.
      advantage_card = deck.discard.shift();
      deck = deck.reshuffle();
      // Put advantage card back in the discard
      deck.discard.unshift(advantage_card)
      deck = deck.draw_card();
    } else {
      deck = deck.draw_card();
      advantage_card = deck.discard[0];
      deck = deck.draw_card();
    }

    return new ModifierDeckState(deck.draw_pile, deck.discard, deck.num_special,
        deck.needs_shuffled, advantage_card);
  }

  reshuffle() {
    const newDraw = [...this.draw_pile];
    // Add non-bless/curse cards back into the draw deck
    for (let i = 0; i < this.discard.length; i += 1) {
      if (this.discard[i].card_type != 'bless' && this.discard[i].card_type != 'curse' ) {
        newDraw.push(this.discard[i]);
      }
    }

    shuffle_list(newDraw);
    const needs_shuffled = false;
    return new ModifierDeckState(newDraw, [], this.num_special, needs_shuffled);
  }

  remove_card(card_type) {
    for (let i = 0; i < this.draw_pile.length; i += 1) {
      if (this.draw_pile[i].card_type == card_type) {

        const newDraw = [...this.draw_pile];
        const numSpecial = {...this.num_special};
        newDraw.splice(i, 1);
        shuffle_list(newDraw);
        numSpecial[card_type] -= 1;
        return new ModifierDeckState(newDraw, this.discard, numSpecial, this.needs_shuffled, this.advantage_card);
      }
    }
    return this;
  }

  add_card(card_type) {
    // Rulebook p. 23: "a maximum of only 10 curse [and 10 bless] cards can be placed into any one deck"
    if (this.num_special[card_type] >= 10) {
      return this;
    }

    const newDraw = [...this.draw_pile];
    const numSpecial = {...this.num_special};
    // TODO: Brittle
    newDraw.push(define_modifier_card(MODIFIER_CARDS[card_type.toUpperCase()]));
    shuffle_list(newDraw);
    numSpecial[card_type] += 1;
    return new ModifierDeckState(newDraw, this.discard, numSpecial, this.needs_shuffled, this.advantage_card);
  }

  end_round() {
    if (this.needs_shuffled) {
      return this.reshuffle();
    }
    return this;
  }
}