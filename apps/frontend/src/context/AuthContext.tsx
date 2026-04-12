import { createContext, useState, useEffect } from 'react';

export interface AuthContextType {
    user: any;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,

});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/users/me", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};


export default AuthContext;