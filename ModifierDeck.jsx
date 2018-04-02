import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import ModifierCardCounter from './ModifierCardCounter';
import ModifierCardFront from './ModifierCardFront';
import ModifierDeckState from './ModifierDeckState';

import * as css from './style/Card.scss';

export default function ModifierDeck(props) {
  const { spec } = props;

  const renderCard = (card, zIndex, cardClasses, faceUp) => {
    return (
      <Card
        classes={cardClasses}
        deckType='modifier'
        faceUp={faceUp}
        zIndex={zIndex}
        renderBack={() => null}
        renderFront={() => (
          <ModifierCardFront image={card.card_image}/>
        )}
      />
    );
  };

  const renderDeck = () => {
    const [topDraw] = props.deckState.draw_pile;
    const [topDiscard, sndDiscard, thdDiscard] = props.deckState.discard;

    if (props.deckState.advantage_card == null) {
      return (
        <div className={classNames(css.cardContainer, css.modifier)} onClick={props.onDrawClick}>
          {topDraw ? renderCard(topDraw, -7, [css.draw], false) : null}
          {topDiscard ? renderCard(topDiscard, -3, [css.discard, css.pull], true) : null}
          {sndDiscard ? renderCard(sndDiscard, -4, [css.discard, css.lift], true) : null}
        </div>
      );
    } else {
      return (
        <div className={classNames(css.cardContainer, css.modifier)} onClick={props.onDrawClick}>
          {topDraw ? renderCard(topDraw, -7, [css.draw], false) : null}
          {renderCard(topDiscard, -3, [css.discard, css.pull, css.right], true)}
          {renderCard(sndDiscard, -3, [css.discard, css.pull, css.left], true)}
          {thdDiscard ? renderCard(thdDiscard, -4, [css.discard, css.lift], true) : null}
        </div>
      );
    }
  };

  const shuffleIndicator = (needsShuffled) => {
    const classes = ['counter-icon', 'shuffle'];
    if (!needsShuffled) {
      classes.push('not-required');
    }
    return (
      <div className={classNames(classes)} onClick={props.onEndRoundClick}/>
    );
  };

  return (
    <div className={css.cardContainer} id='modifier-container'>
      <div className='modifier-deck-column-2'>
        {renderDeck()}
        <div className='button draw-two' onClick={props.onDoubleDrawClick}/>
      </div>
      <div className='modifier-deck-column-1'>
        <ModifierCardCounter
          deckState={props.deckState} modifierType='bless'
          addSpecial={props.onAddSpecialClick}
          removeSpecial={props.onRemoveSpecialClick}/>
        <ModifierCardCounter deckState={props.deckState} modifierType='curse'
          addSpecial={props.onAddSpecialClick}
          removeSpecial={props.onRemoveSpecialClick}/>
        {shuffleIndicator(props.deckState.needs_shuffled)}
      </div>
    </div>
  );
}

ModifierDeck.propTypes = {
  deckState: PropTypes.instanceOf(ModifierDeckState).isRequired,
  onDrawClick: PropTypes.func.isRequired,
  onDoubleDrawClick: PropTypes.func.isRequired,
  onEndRoundClick: PropTypes.func.isRequired,
  onAddSpecialClick: PropTypes.func.isRequired,
  onRemoveSpecialClick: PropTypes.func.isRequired,
};