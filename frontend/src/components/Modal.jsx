// Modal.jsx
import { cloneElement, createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useOutsideClick } from "../hooks/useOutsideClick";

const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");
  const [modalData, setModalData] = useState(null);

  const close = () => {
    setOpenName("");
    setModalData(null);
  };

  const open = setOpenName;

  return (
    <ModalContext.Provider
      value={{ openName, open, close, modalData, setModalData }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens: opensWindowName, taskData }) {
  const { open, setModalData } = useContext(ModalContext);

  return cloneElement(children, {
    onClick: () => {
      setModalData(taskData);
      open(opensWindowName);
    },
  });
}

function Window({ children, name }) {
  const { openName, close, modalData } = useContext(ModalContext);
  const ref = useOutsideClick(close);

  if (name !== openName) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div
        ref={ref}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        bg-slate-800 rounded-xl shadow-xl transition-all duration-500
        w-full max-w-md p-6">
        <button
          onClick={close}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white
          hover:bg-slate-700/50 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div>
          {typeof children === "function"
            ? children(modalData)
            : cloneElement(children, { onClose: close })}
        </div>
      </div>
    </div>,
    document.body
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
