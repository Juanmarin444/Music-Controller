import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { Grid, Button, Typography } from '@material-ui/core';
import CreateRoomPage from './CreateRoomPage';

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false
        };
        this.roomCode = this.props.match.params.roomCode;
        this.getRoomDetails();
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettingsButtons = this.renderSettingsButtons.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getRoomDetails();
    }

    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode)
        .then((response) => {
            if (!response.ok) {
                this.props.leaveRoomCallBack();
                this.props.history('/')
            }
            return response.json()
        })
        .then((data) => {
            this.setState({
                votesToSkip: data.votes_to_skip,
                guestCanPause: data.guest_can_pause,
                isHost: data.is_host
            });
            if (this.state.isHost) {
                this.authenticateSpotify();
            }
        });
    }

    authenticateSpotify() {
        fetch('/spotify/is-authenticated')
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    spotifyAuthenticated: data.status
                });
                if (!data.status) {
                    fetch('/spotify/get-auth-url')
                        .then((response) => response.json())
                        .then((data) => {
                            window.location.replace(data.url);
                        });
                }
            });
    }

    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "applications/json"
            }
        };
        fetch('/api/leave-room', requestOptions).then((_response) => {
            this.props.leaveRoomCallBack();
            this.props.history('/')
        })
    }

    updateShowSettings(value) {
        this.setState({
            showSettings: value,
        });
    }

    renderSettings() {
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align='center'>
                    <CreateRoomPage update={ true } votesToSkip={ this.state.votesToSkip } guestCanPause={this.state.guestCanPause} roomCode={this.roomCode} updateCallback={this.getRoomDetails} />
                </Grid>
                <Grid item xs={12} align='center'>
                    <Button variant="contained" color="secondary" onClick={() => this.updateShowSettings(false)}>Close</Button>
                </Grid>
            </Grid>
        );
        
    }

    renderSettingsButtons() {
        return (
            <Grid item xs={12} align='center'>
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>Settings</Button>
            </Grid>
        );
    }

    render() {

        if(this.state.showSettings) {
            return this.renderSettings()
        }

        return (

            <Grid>
                <Grid item xs={12} align='center'>
                    <Typography variant='h4' component='h4'>Code: {this.roomCode}</Typography>
                </Grid>
                <Grid item xs={12} align='center'>
                <Typography variant='h6' component='h6'>Votes: {this.state.votesToSkip}</Typography>

                </Grid>
                <Grid item xs={12} align='center'>
                <Typography variant='h6' component='h6'>Guest can Pause: {this.state.guestCanPause.toString()}</Typography>

                </Grid>
                <Grid item xs={12} align='center'>
                <Typography variant='h6' component='h6'>Host: {this.state.isHost.toString()}</Typography>

                </Grid>
                {this.state.isHost ? this.renderSettingsButtons() : null}
                <Grid item xs={12} align='center'> 
                    <Button variant="contained" color="secondary" onClick={this.leaveButtonPressed}>Leave Room</Button>
                </Grid>
            </Grid>
        );
    }
}