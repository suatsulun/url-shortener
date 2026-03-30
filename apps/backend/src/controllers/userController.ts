import { Request, Response } from 'express';
import * as userService from '../services/userService.js';
import { generateToken } from '../lib/jwt.js';



export const register = async (req: Request, res: Response) => {
    try {
    const { username, email, password} = req.body;
    const user = await userService.createUser(username, email, password);
    res.status(201).json(user);
    } catch (err:any) {
        res.status(400).json({ error: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { loginName , password } = req.body;
    const user = await userService.findUserByEmail(loginName) || await userService.findUserByUsername(loginName);
    
    if (!user) {
        void res.status(401).json({ error: 'Invalid username, email or password' });
        return;
    }
    const isPasswordValid = await userService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
        void res.status(401).json({ error: 'Invalid username, email or password' });
        return;
    }
    const tokenValue = generateToken(user.id);

    res.cookie("token", tokenValue, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    };

export const logout = (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
}
    
export const getCurrentUser = async (req: Request, res: Response) => {
    const userId = req.userId as number;
    const user = await userService.findUserById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
}

export const editMe = async (req: Request, res: Response) => {
    const { username, email } = req.body;
    const userId = req.userId as number;
    try {
        const updatedUser = await userService.editUser(userId, username, email);
        res.json(updatedUser);
    } catch (err:any) {
        res.status(400).json({ error: err.message });
    }
}

export const changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId as number;
    try {
        await userService.changePassword(userId, oldPassword, newPassword);
        res.json({ message: "Password changed successfully" });
    } catch (err:any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteMe = async (req: Request, res: Response) => {
    const userId = req.userId as number;
    try {
        await userService.deleteUser(userId);
        res.clearCookie("token");
        res.status(204).send();
    } catch (err:any) {
        res.status(400).json({ error: err.message });
    }
};

