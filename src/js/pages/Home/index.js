
import React, { Component } from 'react';
import Scroller from 'react-scroll-horizontal';
import { Link } from 'react-router';
import { inject, observer } from 'mobx-react';
import injectSheet from 'react-jss';
import moment from 'moment';
import clazz from 'classname';

import classes from './classes';
import helper from 'utils/helper';
import Loader from 'ui/Loader';
import Header from 'components/Header';
import Controller from 'components/Controller';

@inject(stores => ({
    hasLogin: stores.me.hasLogin,
    playlist: stores.home.list,
    getPlaylist: stores.home.getList,
    loading: stores.home.loading,
}))
@observer
class Home extends Component {
    componentDidMount() {
        this.props.getPlaylist();
    }

    renderItem(item) {
        var classes = this.props.classes;

        return (
            <Link
                to={item.link}
                className="clearfix">
                <img src={item.cover} />

                <div className={classes.info}>
                    <span className={classes.subtitle}>
                        {
                            helper.humanNumber(item.played)
                        }
                    </span>
                    <div className={classes.title}>
                        {item.name}
                    </div>
                </div>
            </Link>
        );
    }

    renderLiked(item) {
        var classes = this.props.classes;

        return (
            <Link
                className={clazz('clearfix', classes.liked)}
                to={item.link}>
                <div className={classes.cover}>
                    <div>
                        {item.name}
                    </div>
                </div>

                <div className={classes.meta}>
                    <p className={classes.subtitle}>
                        {item.size} Tracks
                    </p>
                    <p
                        className={classes.subtitle}
                        style={{
                            fontSize: 12,
                        }}>
                        {moment(item.updateTime).endOf('day').fromNow()}
                    </p>
                </div>
            </Link>
        );
    }

    renderDaily(item) {
        var classes = this.props.classes;

        return (
            <div className={clazz('clearfix', classes.daily)}>
                <div className={classes.mask}>
                    <i className="ion-ios-play" />
                </div>

                <div className={classes.info}>
                    <span className={classes.subtitle}>
                        {item.size} Tracks
                    </span>
                    <div className={classes.title}>
                        {item.name}
                    </div>
                </div>
            </div>
        );
    }

    renderPlaylist() {
        var { classes, playlist } = this.props;
        var logined = this.props.hasLogin();

        return (
            <Scroller>
                {
                    playlist.map((e, index) => {
                        var isLiked = logined && index === 0;
                        var isDaily = logined && index === 1;

                        return (
                            <div
                                className={clazz('clearfix', classes.item)}
                                key={index}>
                                {

                                    isLiked
                                        ? this.renderLiked(e)
                                        : (isDaily ? this.renderDaily(e) : this.renderItem(e))
                                }
                            </div>
                        );
                    })
                }
            </Scroller>
        );
    }

    render() {
        var { classes, loading } = this.props;

        return (
            <div
                className={classes.container}
                ref="container">
                <Loader show={loading} />
                <Header {...{
                    showBack: false,
                }} />

                <main>
                    <div
                        className={classes.logo}
                        dangerouslySetInnerHTML={{__html: `
                            <svg class="${classes.svg}">
                                <defs>
                                    <pattern id="mask" patternUnits="userSpaceOnUse" height="600" width="600">
                                        <image xmlns:xlink="http://www.w3.org/1999/xlink" x="100px" y="-100px" xlink:href="https://trazyn.github.io/neoui-ng/images/bgcolorful.jpg" width="600" height="600"></image>
                                    </pattern>
                                </defs>
                                <text class="${classes.welcome}" text-anchor="middle" x="50%" y="0" dy="100px">Welcome</text>
                            </svg>
                        `}} />

                    <div style={{
                        marginTop: 20,
                    }}>
                        {
                            this.renderPlaylist()
                        }
                    </div>
                </main>

                <Controller />
            </div>
        );
    }
}

export default injectSheet(classes)(Home);
