import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const findUserByEmail = async (email: string) => {
    const user = await db.select().from(users).where(eq(users.email, email));
    return user[0] || null;
};

export const findUserByUsername = async (username: string) => {
    const user = await db.select().from(users).where(eq(users.username, username));
    return user[0] || null;
};

export const findUserById = async (id: number) => {
    const user = await db.select().from(users).where(eq(users.id, id));
    return user[0] || null;
};


export const createUser = async (username: string, email:string, password: string) => {
    if (await findUserByEmail(email)) {
        throw new Error("Email already exists");
    }
    if (await findUserByUsername(username)) {
        throw new Error("Username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
        username,
        email,
        passwordHash: hashedPassword,
    }).returning();
    const { passwordHash: _, ...userWithoutPassword } = newUser;


    return userWithoutPassword;
};

export const verifyPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

export const editUser = async (id: number, username?: string, email?: string) => {
    const updateData: Partial<{ username: string; email: string }> = {};
    if (username) {
        if (await findUserByUsername(username)) {
            throw new Error("Username already exists");
        }
        updateData.username = username;
    }
    if (email) {
        if (await findUserByEmail(email)) {
            throw new Error("Email already exists");
        }
        updateData.email = email;
    }
    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
};

export const changePassword = async (id: number, oldPassword: string, newPassword: string) => {
    const user = await findUserById(id);
    if (!user) {
        throw new Error("User not found");
    }
    const isOldPasswordValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
        throw new Error("Old password is incorrect");
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash: hashedNewPassword }).where(eq(users.id, id));
};

export const deleteUser = async (id: number) => {
    await db.delete(users).where(eq(users.id, id));
};
