const express = require("express");

const jwt = require("jsonwebtoken");
const axios = require("axios")

const GenrateLink = async ({ title }, next) => {
    try {
        const tokenPayload = {
            iss: process.env.ZOOM_CLIENT_ID,
            exp: Math.floor(Date.now() / 1000) + 6000,
        };
        const token = jwt.sign(tokenPayload, process.env.ZOOM_PRIVATE_KEY);

        const meetingDetails = {
            // topic: title ?? 'Meeting Topic',
            topic: 'Meeting Topic',
            type: 1, // 1 for instant meeting, 2 for scheduled meeting
            duration: 60, // Meeting duration in minutes
        };

        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            meetingDetails,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("------------ AXIOS-ZOOM -----------> ", response);
        if (response.status != 201) {
            next(response)
            return
        }
        return { adminLink: response.data.start_url, link: response.data.join_url }

    } catch (err) {
        console.log("******** AXIOS-ZOOM ********", err);
        next(err)
    }
}

module.exports = GenrateLink;