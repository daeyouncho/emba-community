export declare enum UserRole {
    STUDENT = "student",
    PROFESSOR = "professor",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    birthYear: number;
    company: string;
    position: string;
    profileImage: string;
    latitude: number;
    longitude: number;
    locationUpdatedAt: Date;
    role: UserRole;
    kakaoId: string;
    googleRefreshToken: string;
    isActive: boolean;
    notificationEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
