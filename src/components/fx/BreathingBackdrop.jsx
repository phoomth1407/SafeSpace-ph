import React from 'react';

export default function BreathingBackdrop() {
  return (
    <div className="ss-backdrop" aria-hidden="true">
      <div className="ss-orb ss-orb--a" />
      <div className="ss-orb ss-orb--b" />
      <div className="ss-orb ss-orb--c" />
      <div className="ss-grain" />
    </div>
  );
}
