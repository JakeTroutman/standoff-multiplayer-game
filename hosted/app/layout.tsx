import type { Metadata } from "next";
export const metadata: Metadata = {title:"STANDOFF!",description:"A two-player Western duel."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
