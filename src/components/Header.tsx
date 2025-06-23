import { MobileMenu } from "./MobileMenu";

export function Header({ userEmail }: { userEmail: string }) {
  return (
    <header className="fixed h-[60px] w-full top-0 left-0 flex justify-center items-center bg-background z-[100]">
        {userEmail && <MobileMenu userName={userEmail} />}
        <h1 className="text-2xl font-bold text-primary">Gym Hustle</h1>
    </header>
  );
} 