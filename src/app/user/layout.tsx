import Navigation from "../components/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh flex flex-col justify-center items-center mx-auto max-w[430px]">
      {children}
      <Navigation />
    </div>
  );
}
