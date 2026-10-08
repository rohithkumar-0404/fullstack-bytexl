const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==================== MONGODB CONNECTION ====================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });


// ==================== MEMBER SCHEMA ====================

const memberSchema = new mongoose.Schema({
    memberId: String,
    name: String,
    clubName: String,
    year: Number,
    role: String,
    points: Number,
    interests: String,
    status: String
});

const Member = mongoose.model("Member", memberSchema);


// ==================== BUDDY SCHEMA ====================

const buddySchema = new mongoose.Schema({
    buddyId: String,
    name: String,
    destination: String,
    age: Number,
    budget: Number,
    tripDuration: Number,
    interests: String,
    status: String
});

const Buddy = mongoose.model("Buddy", buddySchema);


// ==================== HOME PAGE ====================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ==================================================
//                 CLUB MEMBERS
// ==================================================

// Add Member
app.post("/members", async (req, res) => {
    try {
        const member = new Member({
            memberId: req.body.memberId,
            name: req.body.name,
            clubName: req.body.clubName,
            year: Number(req.body.year),
            role: req.body.role,
            points: Number(req.body.points),
            interests: req.body.interests,
            status: req.body.status
        });

        await member.save();

        res.send(`
            <h2>Club member added successfully</h2>
            <a href="/">Go Back</a>
        `);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding member");
    }
});


// Search members by club and points
app.get("/member-search", async (req, res) => {
    try {
        const members = await Member.find({
            clubName: req.query.clubName,
            points: { $gt: Number(req.query.points) }
        }).select("name clubName role points -_id");

        res.json(members);

    } catch (error) {
        res.status(500).send("Error searching members");
    }
});


// Search member by ID
app.get("/member/:id", async (req, res) => {
    try {
        const member = await Member.findOne({
            memberId: req.params.id
        }).select("name clubName role points -_id");

        res.json(member);

    } catch (error) {
        res.status(500).send("Error finding member");
    }
});


// Display all members
app.get("/members", async (req, res) => {
    try {
        const members = await Member.find()
            .select("name clubName role points -_id");

        res.json(members);

    } catch (error) {
        res.status(500).send("Error getting members");
    }
});


// Update role and points
app.put("/member-update/:id", async (req, res) => {
    try {
        await Member.updateOne(
            { memberId: req.params.id },
            {
                role: req.body.role,
                points: Number(req.body.points)
            }
        );

        res.send("Member updated successfully");

    } catch (error) {
        res.status(500).send("Error updating member");
    }
});


// Increase points for a club
app.put("/increase-points", async (req, res) => {
    try {
        await Member.updateMany(
            { clubName: req.body.clubName },
            {
                $inc: {
                    points: Number(req.body.points)
                }
            }
        );

        res.send("Points increased successfully");

    } catch (error) {
        res.status(500).send("Error increasing points");
    }
});


// Search members within points range
app.get("/points-range", async (req, res) => {
    try {
        const members = await Member.find({
            points: {
                $gte: Number(req.query.min),
                $lte: Number(req.query.max)
            }
        }).select("name clubName role points -_id");

        res.json(members);

    } catch (error) {
        res.status(500).send("Error searching points");
    }
});


// Delete member
app.delete("/member-delete/:id", async (req, res) => {
    try {
        await Member.deleteOne({
            memberId: req.params.id
        });

        res.send("Member deleted successfully");

    } catch (error) {
        res.status(500).send("Error deleting member");
    }
});


// Sort members by points
app.get("/members-sort", async (req, res) => {
    try {
        const members = await Member.find()
            .select("name clubName role points -_id")
            .sort({ points: -1 });

        res.json(members);

    } catch (error) {
        res.status(500).send("Error sorting members");
    }
});


// ==================================================
//                 TRAVEL BUDDY
// ==================================================

// Add Travel Buddy
app.post("/buddies", async (req, res) => {
    try {
        const buddy = new Buddy({
            buddyId: req.body.buddyId,
            name: req.body.name,
            destination: req.body.destination,
            age: Number(req.body.age),
            budget: Number(req.body.budget),
            tripDuration: Number(req.body.tripDuration),
            interests: req.body.interests,
            status: req.body.status
        });

        await buddy.save();

        res.send(`
            <h2>Travel Buddy added successfully</h2>
            <a href="/">Go Back</a>
        `);

    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding buddy");
    }
});


// Search by destination and budget
app.get("/buddy-search", async (req, res) => {
    try {
        const buddies = await Buddy.find({
            destination: req.query.destination,
            budget: { $gt: Number(req.query.budget) }
        }).select("name destination budget tripDuration -_id");

        res.json(buddies);

    } catch (error) {
        res.status(500).send("Error searching buddies");
    }
});


// Search buddy by ID
app.get("/buddy/:id", async (req, res) => {
    try {
        const buddy = await Buddy.findOne({
            buddyId: req.params.id
        }).select("name destination budget tripDuration -_id");

        res.json(buddy);

    } catch (error) {
        res.status(500).send("Error finding buddy");
    }
});


// Display all buddies
app.get("/buddies", async (req, res) => {
    try {
        const buddies = await Buddy.find()
            .select("name destination budget tripDuration -_id");

        res.json(buddies);

    } catch (error) {
        res.status(500).send("Error getting buddies");
    }
});


// Update destination and budget
app.put("/buddy-update/:id", async (req, res) => {
    try {
        await Buddy.updateOne(
            { buddyId: req.params.id },
            {
                destination: req.body.destination,
                budget: Number(req.body.budget)
            }
        );

        res.send("Travel Buddy updated successfully");

    } catch (error) {
        res.status(500).send("Error updating buddy");
    }
});


// Increase budget for destination
app.put("/increase-budget", async (req, res) => {
    try {
        await Buddy.updateMany(
            { destination: req.body.destination },
            {
                $inc: {
                    budget: Number(req.body.amount)
                }
            }
        );

        res.send("Budget increased successfully");

    } catch (error) {
        res.status(500).send("Error increasing budget");
    }
});


// Search buddies within budget range
app.get("/budget-range", async (req, res) => {
    try {
        const buddies = await Buddy.find({
            budget: {
                $gte: Number(req.query.min),
                $lte: Number(req.query.max)
            }
        }).select("name destination budget tripDuration -_id");

        res.json(buddies);

    } catch (error) {
        res.status(500).send("Error searching budget");
    }
});


// Delete buddy
app.delete("/buddy-delete/:id", async (req, res) => {
    try {
        await Buddy.deleteOne({
            buddyId: req.params.id
        });

        res.send("Travel Buddy deleted successfully");

    } catch (error) {
        res.status(500).send("Error deleting buddy");
    }
});


// Sort buddies by budget
app.get("/buddies-sort", async (req, res) => {
    try {
        const buddies = await Buddy.find()
            .select("name destination budget tripDuration -_id")
            .sort({ budget: -1 });

        res.json(buddies);

    } catch (error) {
        res.status(500).send("Error sorting buddies");
    }
});


// ==================== EXPORT APP ====================

module.exports = app;