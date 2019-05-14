import React, { Component } from "react";
import { View, Animated, PanResponder, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  };

  constructor(props) {
    super(props);
    this.position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        this.position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.hideCard(true);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.hideCard(false);
        } else {
          this.resetCardPosition();
        }
      }
    });

    this.state = { panResponder, index: 0 };
  }

  hideCard(isRight) {
    Animated.timing(this.position, {
      toValue: { x: isRight ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(isRight));
  }

  resetCardPosition() {
    Animated.spring(this.position, { toValue: { x: 0, y: 0 } }).start();
  }

  onSwipeComplete(isRight) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    // increment for the next card
    this.setState({ index: this.state.index + 1 });

    //reset position for the next card
    this.position.setValue({ x: 0, y: 0 });

    isRight ? onSwipeRight(item) : onSwipeLeft(item);
  }

  getCardStyle() {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"]
    });

    return {
      ...this.position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards() {
    return this.props.data.map((item, i) => {
      if (i < this.state.index) {
        return null;
      }

      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={this.getCardStyle()}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }

      return this.props.renderCard(item);
    });
  }

  render() {
    return this.renderCards();
  }
}

export default Deck;
