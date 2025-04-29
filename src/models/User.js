const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    lastDaily: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastWork: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = User;
