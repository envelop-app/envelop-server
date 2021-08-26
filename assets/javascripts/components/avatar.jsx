import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Person} from '@stacks/profile';
import copy from 'copy-to-clipboard';
import prettyBytes from 'pretty-bytes';
import {privateUserSession} from '../lib/blockstack_client';
import Toast from '../lib/toast.jsx';
import Menu, {
  MenuList,
  MenuListItem,
  MenuListItemText,
} from '@material/react-menu';

class AvatarComponent extends Component {
  constructor(props) {
    super(props);
    this.anchorRef = React.createRef();
    const user = privateUserSession.loadUserData();
    this.state = {
      coordinates: undefined,
      open: false,
      user: user,
      person: new Person(user.profile),
      avatarUrl: '/images/default-avatar.png',
    };
  }

  componentDidMount() {
    this.setSize();
    window.addEventListener('resize', () => this.setSize());

    const avatarUrl = this.state.person.avatarUrl();

    if (avatarUrl) {
      fetch(avatarUrl)
        .then(response => response.blob())
        .then(image => {
          const objectUrl = URL.createObjectURL(image);
          this.setState({avatarUrl: objectUrl});
        });
    }
  }

  setSize() {
    const anchorPosition = this.anchorRef.current.getBoundingClientRect();

    this.setState({
      coordinates: {
        x: anchorPosition.x + anchorPosition.width,
        y: anchorPosition.y + anchorPosition.height,
      },
    });
  }

  avatarUrl() {
    return this.state.avatarUrl;
  }

  displayName() {
    const {person, user} = this.state;

    return (
      person.name() ||
      (user.username && user.username.replace('.id.blockstack', '')) ||
      user.email ||
      user.decentralizedID
    );
  }

  onOpen = () => {
    this.setState({open: true});
  };

  onClose = () => {
    this.setState({open: false});
  };

  onSelect = item => {
    if (item == 0) {
      window.open('/#homepage-extensions', '_blank');
    } else if (item == 1) {
      window.open(
        'https://play.google.com/store/apps/details?id=app.envelop',
        '_blank',
      );
    } else if (item == 2) {
      window.open('/faq.html', '_blank');
    } else if (item == 3) {
      window.open(
        'mailto:feedback@envelop.app?subject=Envelop Feedback',
        '_blank',
      );
    } else if (item == 4) {
      privateUserSession.signUserOut();
      window.location = window.location.origin;
    }
  };

  render() {
    return (
      <div
        ref={this.anchorRef}
        onClick={this.onOpen}
        style={{width: '100%', height: '100%'}}>
        <span className="ev-navbar__item-link">
          <span className="ev-navbar__username">{this.displayName()}</span>
          <span className="ev-navbar__avatar">
            <img src={this.avatarUrl()} alt="avatar" />
          </span>
        </span>
        <Menu
          open={this.state.open}
          onClose={this.onClose}
          coordinates={this.state.coordinates}
          onSelected={this.onSelect}>
          <MenuList>
            <MenuListItem>
              <MenuListItemText primaryText={'Browser extensions'} />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemText primaryText={'Android app'} />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemText primaryText={'FAQs'} />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemText primaryText={'Send us feedback'} />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemText primaryText={'Log Out'} />
            </MenuListItem>
          </MenuList>
        </Menu>
      </div>
    );
  }
}

export default AvatarComponent;
