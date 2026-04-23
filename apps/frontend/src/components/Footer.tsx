import { Button } from "@/components/ui/Button";
import { FaGithub, FaXTwitter, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

const Footer = () => {

    const mediaButtons = [
        {
            icon: FaXTwitter,
            url: "https://www.x.com/",
            label: "X / Twitter",
        },
        {
            icon: FaInstagram,
            url: "https://www.instagram.com/",
            label: "Instagram",
        },
        {
            icon: FaLinkedin,
            url: "https://www.linkedin.com/",
            label: "LinkedIn",
        },
        {
            icon: FaGithub,
            url: "https://www.github.com/suatsulun",
            label: "GitHub",
        },
        {
            icon: SiGmail,
            url: "mailto:suat.ssulun@gmail.com",
            label: "Contact via Email",
        }
    ];


    return (
      <footer>
        <div className="border-t border-ink/10 bg-surface py-6 flex justify-around items-center">
          <div>
            <p className="text-center text-sm text-muted">
              &copy; {new Date().getFullYear()} Suat's URL Shortener. All rights
              reserved.
            </p>
          </div>
          <div className="flex items-center justify-center mt-4 gap-4">
            {mediaButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={() => window.open(button.url, "_blank", "noopener,noreferrer")}
                aria-label={button.label}
              >
                <button.icon />
              </Button>
            ))}
          </div>
        </div>
      </footer>
    );};

export default Footer;