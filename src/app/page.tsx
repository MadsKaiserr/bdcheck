import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BD Check Tool | Bonzer",
  description: "",
};

export default async function Home() {

    return (
        <div className="main__container">
            <div className="platform__wrapper">
                <div className="platform__element">
                    <h1 className="pagespeed__heading">Seneste Technical Audits</h1>
                    <ul className="pagespeed__container pagespeed__settings">
                    </ul>
                </div>
            </div>
        </div>
    );
}