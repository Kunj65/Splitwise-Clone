import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

/*
GET FRIENDS
*/
router.get("/", async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("friends", "_id name email");

        res.json({
            friends: user.friends || [],
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load friends",
        });
    }
});

/*
ADD FRIEND
*/
router.post("/:friendId", async (req, res) => {
    try {
        const userId = req.user._id;
        const friendId = req.params.friendId;

        if (userId.toString() === friendId.toString()) {
            return res.status(400).json({
                message: "Cannot add yourself",
            });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const alreadyFriend = user.friends.some(
            (id) => id.toString() === friendId
        );

        if (alreadyFriend) {
            return res.status(400).json({
                message: "Already friends",
            });
        }

        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    friends: friendId,
                },
            }
        );

        await User.findByIdAndUpdate(
            friendId,
            {
                $addToSet: {
                    friends: userId,
                },
            }
        );

        await user.save();
        await friend.save();

        res.json({
            message: "Friend added",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add friend",
        });
    }
});

/*
REMOVE FRIEND
*/
router.delete("/:friendId", async (req, res) => {
    try {
        const userId = req.user._id;
        const friendId = req.params.friendId;

        await User.findByIdAndUpdate(userId, {
            $pull: {
                friends: friendId,
            },
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: {
                friends: userId,
            },
        });

        res.json({
            message: "Friend removed",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to remove friend",
        });
    }
});

export default router;