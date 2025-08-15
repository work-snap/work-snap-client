"use client";

import Header from "../components/Header";
import Navigation from "../components/navigation";

export default function AttendanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-dvh flex flex-col justify-between min-h-0">
            <div>
                <Header />
                {children}
            </div>
            <Navigation />
        </div>
    );
}
