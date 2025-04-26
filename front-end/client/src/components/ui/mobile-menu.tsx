import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { scrollToElement } from "@/lib/utils-ui";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-teal/20">
        <div className="text-2xl font-bold font-playfair">
          <span className="text-navy">Voice</span>
          <span className="text-teal">Weave</span>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-navy">
          <i className="ri-close-line text-2xl"></i>
        </Button>
      </div>
      <div className="flex flex-col p-4 space-y-4 font-montserrat text-lg">
        <button 
          className="text-navy py-2 border-b border-gray text-left bg-transparent"
          onClick={() => {
            scrollToElement('about');
            handleLinkClick();
          }}
        >
          About
        </button>
        <button 
          className="text-navy py-2 border-b border-gray text-left bg-transparent"
          onClick={() => {
            scrollToElement('demo');
            handleLinkClick();
          }}
        >
          Demo
        </button>
      </div>
    </div>
  );
}
