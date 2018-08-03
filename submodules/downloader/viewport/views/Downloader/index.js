
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import injectSheet from 'react-jss';
import delegate from 'delegate';
import moment from 'moment';
import { ipcRenderer } from 'electron';

import classes from './classes';
import ProgressImage from 'ui/ProgressImage';

function humanSize(size) {
    var value = (size / 1024).toFixed(1);

    if (size > (1024 << 10)) {
        value = (value / 1024).toFixed(1);
        return `${value} M`;
    } else {
        return `${value} KB`;
    }
};

@inject('stores')
@observer
class Downloader extends Component {
    state = {
        selected: 'all',
    }

    highlight() {
        var classes = this.props.classes;
        var selected = this.state.selected;
        var eles = this.navs.children;

        Array.from(eles).map(
            e => {
                var key = e.dataset.index;

                if (key !== selected) {
                    e.classList.remove(classes.selected);
                    return;
                }

                e.classList.add(classes.selected);
            }
        );
    }

    componentDidMount() {
        var { stores: { load, updateTask, doneTask, failTask } } = this.props;

        delegate(
            this.navs, 'a[data-index]', 'click',
            e => {
                e.preventDefault();
                this.setState({ selected: e.target.dataset.index });
            }
        );

        ipcRenderer.on('download-begin', (e, args) => {
            updateTask(args.task);
        });

        ipcRenderer.on('download-progress', (e, args) => {
            updateTask(args.task);
        });

        ipcRenderer.on('download-success', (e, args) => {
            doneTask(args.task);
        });

        ipcRenderer.on('download-failure', (e, args) => {
            failTask(args.task, args.err);
        });

        load();
    }

    renderDetail(item) {
        var { classes, stores: { removeTask } } = this.props;
        var song = item.payload;
        var name = song.name;
        var artists = song.artists.map((e, index) => e.name).join();

        if (item.progress === 1) {
            return (
                <aside>
                    <p className={classes.title}>
                        {name}
                    </p>

                    <small style={{ marginTop: -6 }}>
                        {artists}
                    </small>

                    <small>
                        {
                            moment(item.date).fromNow()
                        }
                    </small>

                    <div className={classes.hovers}>
                        {
                            humanSize(item.size)
                        }

                        <a
                            href=""
                            onClick={
                                e => {
                                    e.preventDefault();
                                    removeTask(item);
                                    ipcRenderer.send('download-remove', { task: JSON.stringify(item) });
                                }
                            }
                        >
                            <i className="ion-trash-b" />
                        </a>
                    </div>
                </aside>
            );
        }

        return (
            <aside>
                <span className={classes.title}>
                    {name} - {artists}
                </span>

                <div className={classes.progress}>
                    <div
                        className={classes.passed}
                        style={{
                            width: `${item.progress * 100}%`,
                        }}
                    />
                </div>
            </aside>
        );
    }

    render() {
        var { classes, stores: { tasks } } = this.props;

        tasks = tasks.filter(
            e => {
                switch (this.state.selected) {
                    case 'all':
                        return true;

                    case 'inProgress':
                        return e.progress !== 1;

                    case 'done':
                        return e.progress === 1;
                }
            }
        );

        return (
            <div className={classes.container}>
                <nav
                    ref={ele => {
                        if (!ele) return;

                        this.navs = ele;
                        this.highlight();
                    }}
                >
                    <a data-index="all">All</a>
                    <a data-index="inProgress">In Progress</a>
                    <a data-index="done">Done</a>
                </nav>

                <section>
                    {
                        tasks.map(
                            (e, index) => {
                                var song = e.payload;

                                return (
                                    <div
                                        key={index}
                                        className={classes.item}
                                        style={{
                                            marginBottom: index === tasks.length - 1 ? 24 : 0
                                        }}
                                    >
                                        <ProgressImage
                                            {...{
                                                width: 64,
                                                src: song.album.cover.replace(/\?.*/, ''),
                                                className: classes.cover,
                                            }}
                                        />

                                        {
                                            this.renderDetail(e)
                                        }
                                    </div>
                                );
                            }
                        )
                    }
                </section>

                <footer>
                    <button
                        onClick={
                            e => {
                                // TODO:
                            }
                        }
                    >
                        <i className="ion-android-open" />
                        Open Folder
                    </button>

                    <button
                        onClick={
                            e => {
                                // TODO:
                            }
                        }
                    >
                        <i className="ion-ios-close" />
                        Clear All
                    </button>
                </footer>
            </div>
        );
    }
}

export default injectSheet(classes)(Downloader);
