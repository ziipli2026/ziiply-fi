export const metadata = {
 title: 'Ziiply – suojattu mobiiliohje',
 robots: { index: false, follow: false },
};
export default function RootLayout({ children }) {
 return <html lang="fi"><body style={{margin:0,fontFamily:'system-ui, sans-serif',background:'#f8f3e3',color:'#163e30'}}>{children}</body></html>;
}
