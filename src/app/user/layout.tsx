import Navigation from "../components/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex flex-col justify-between">
      {children}
      <Navigation />
    </div>
  );
}
