import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
const mockCreate = vi.fn();

let authenticated = false;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../src/api/appClient", () => ({
  appClient: {
    entities: {
      ContactRequest: {
        create: (...args) => mockCreate(...args),
      },
    },
  },
}));

vi.mock("../src/lib/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: authenticated,
  }),
}));

vi.mock("../src/lib/i18n", () => ({
  useTranslation: () => ({
    lang: "th",
    t: (key) =>
      ({
        "contact.loginPrompt": "กรุณาเข้าสู่ระบบก่อนติดต่อทีมงาน",
        "nav.login": "เข้าสู่ระบบ",
        "contact.title": "ติดต่อทีมงาน",
        "contact.subtitle": "ส่งข้อความถึงทีมงาน",
        "contact.subject": "หัวข้อ",
        "contact.subjectPlaceholder": "หัวข้อ",
        "contact.message": "ข้อความ",
        "contact.messagePlaceholder": "ข้อความ",
        "contact.submit": "ส่ง",
        "contact.submitting": "กำลังส่ง",
        "contact.success": "ส่งสำเร็จ",
        "contact.back": "กลับ",
        "contact.error": "ส่งไม่สำเร็จ",
        "contact.errorShort": "กรุณากรอกข้อมูลให้ครบ",
        "contact.type.feedback": "ข้อเสนอแนะ",
        "contact.type.bug": "บั๊ก",
        "contact.type.glitch": "ระบบขัดข้อง",
        "contact.type.question": "คำถาม",
        "contact.type.other": "อื่นๆ",
      }[key] || key),
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

import ContactAdmin from "../src/pages/ContactAdmin";

describe("ContactAdmin auth behavior", () => {
  beforeEach(() => {
    authenticated = false;
    mockCreate.mockReset();
    mockNavigate.mockReset();
  });

  it("blocks guests and shows the login prompt", () => {
    render(
      <MemoryRouter>
        <ContactAdmin />
      </MemoryRouter>,
    );

    expect(screen.getByText("กรุณาเข้าสู่ระบบก่อนติดต่อทีมงาน")).toBeInTheDocument();
    expect(screen.queryByText("ส่ง")).not.toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("allows authenticated users to submit a contact request", async () => {
    authenticated = true;
    mockCreate.mockResolvedValue({
      id: "contact-test",
      type: "feedback",
      subject: "Test",
      message: "Hello",
      status: "pending",
    });

    render(
      <MemoryRouter>
        <ContactAdmin />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("หัวข้อ"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByPlaceholderText("ข้อความ"), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByText("ส่ง"));

    await vi.waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));

    expect(mockCreate).toHaveBeenCalledWith({
      type: "feedback",
      subject: "Test",
      message: "Hello",
      language: "th",
      status: "pending",
    });
  });
});
