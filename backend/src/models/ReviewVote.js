import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReviewVote = sequelize.define('ReviewVote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    review_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    vote_type: {
        type: DataTypes.ENUM('up', 'down'),
        allowNull: false,
    },
}, {
    tableName: 'review_votes',
    timestamps: true,
    underscored: true,
});

export default ReviewVote;
