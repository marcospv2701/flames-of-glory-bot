// Data/dataPoints.js
const fs = require('fs');
const path = require('path');

const pointsFilePath = path.join(__dirname, '../points.json');

function loadPoints() {
    try {
        if (!fs.existsSync(pointsFilePath)) {
            fs.writeFileSync(pointsFilePath, JSON.stringify({}, null, 2));
        }
        return JSON.parse(fs.readFileSync(pointsFilePath, 'utf8') || '{}');
    } catch (err) {
        console.error('❌ Error loading points.json:', err);
        return {};
    }
}

function savePoints(data) {
    try {
        fs.writeFileSync(pointsFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('❌ Error saving points.json:', err);
    }
}

function addPoints(userId, amount) {
    const points = loadPoints();
    if (!points[userId]) points[userId] = { points: 0 };
    points[userId].points += amount;
    savePoints(points);
    return points[userId].points;
}

function getPoints(userId) {
    const points = loadPoints();
    return (points[userId] && points[userId].points) ? points[userId].points : 0;
}

function setPoints(userId, amount) {
    const points = loadPoints();
    points[userId] = { points: amount };
    savePoints(points);
    return points[userId].points;
}

module.exports = { addPoints, getPoints, setPoints, loadPoints, savePoints };
