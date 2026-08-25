"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { maskImage } from "@/data/projects";

interface CardData {
  id: string;
  titleTop: string;
  titleMasked: string;
  image: string;
}

interface CardGridProps {
  cards: CardData[];
}

class CardGridResizer {
  private wrapper: HTMLElement;
  private cards: NodeListOf<Element>;
  private columns = 0;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;
    this.cards = wrapper.querySelectorAll(".card");
    this.columns = this._getColumnsInRow();
    this._resize();

    this._onResize = this._onResize.bind(this);
    window.addEventListener("resize", this._onResize);
  }

  private _getColumnsInRow(): number {
    let count = 0;
    for (let i = this.cards.length - 1; i >= 0; i--) {
      if ((this.cards[i] as HTMLElement).offsetTop === 0) {
        count++;
      }
    }
    return count;
  }

  private _resize(): void {
    const w = this.wrapper.clientWidth;
    const snapped = w - (w % this.columns);
    this.wrapper.style.width = snapped + "px";

    const height = (this.cards[0] as HTMLElement).clientHeight - 1;
    for (let i = this.cards.length - 1; i >= 0; i--) {
      (this.cards[i] as HTMLElement).style.height = height + "px";
    }
  }

  private _onResize(): void {
    for (let i = this.cards.length - 1; i >= 0; i--) {
      (this.cards[i] as HTMLElement).style.height = "auto";
    }
    this.wrapper.style.width = "100%";

    requestAnimationFrame(() => {
      this.columns = this._getColumnsInRow();
      this._resize();
    });
  }

  destroy(): void {
    window.removeEventListener("resize", this._onResize);
    this.wrapper.style.width = "";
    for (let i = this.cards.length - 1; i >= 0; i--) {
      (this.cards[i] as HTMLElement).style.height = "";
    }
  }
}

class CardManager {
  private cards: HTMLElement[];
  private observers: IntersectionObserver[] = [];
  private timers: Map<HTMLElement, number> = new Map();

  constructor(section: HTMLElement) {
    this.cards = Array.from(section.querySelectorAll(".card"));
    this._setupEngagement();
  }

  private _setupEngagement(): void {
    this.cards.forEach((card) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
              const timer = window.setTimeout(() => {
                this._deactivateAll();
                card.classList.add("card-active");
              }, 100);
              this.timers.set(card, timer);
            } else {
              const timer = this.timers.get(card);
              if (timer) {
                clearTimeout(timer);
                this.timers.delete(card);
              }
            }
          });
        },
        { threshold: 0.8 },
      );
      observer.observe(card);
      this.observers.push(observer);
    });
  }

  private _deactivateAll(): void {
    this.cards.forEach((card) => card.classList.remove("card-active"));
  }

  destroy(): void {
    this.observers.forEach((o) => o.disconnect());
    this.timers.forEach((t) => clearTimeout(t));
    this._deactivateAll();
  }
}

export function Card({ card }: { card: CardData }) {
  return (
    <div className="card relative float-left">
      <div className="block w-full pt-[56.25%]" />

      <Link
        className="card-content block absolute inset-0 z-[1] overflow-hidden border-b border-r border-[#444] no-underline"
        href={`/project/${card.id}`}
        aria-label={`Ver: ${card.titleTop} ${card.titleMasked}`}
      >
        <div className="card-text absolute inset-0 z-[2] opacity-100">
          <h3 className="card-text-content typography-card-headline">
            <div role="text">
              {card.titleTop.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
              <br />
              <div
                className="card-text-masked"
                style={
                  {
                    "--card-mask-image": `url(${maskImage(card.image)})`,
                  } as React.CSSProperties
                }
              >
                {card.titleMasked}
              </div>
            </div>
          </h3>
        </div>

        <div
          className="card-image"
          style={{ backgroundImage: `url(${card.image})` }}
        />
      </Link>
    </div>
  );
}

export function CardGrid({ cards }: CardGridProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const resizerRef = useRef<CardGridResizer | null>(null);
  const managerRef = useRef<CardManager | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  const wrapperCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (resizerRef.current) {
        resizerRef.current.destroy();
        resizerRef.current = null;
      }
      wrapperRef.current = node;
      if (node && !isTouchDevice) {
        resizerRef.current = new CardGridResizer(node);
      }
    },
    [isTouchDevice],
  );

  useEffect(() => {
    if (!isTouchDevice || !sectionRef.current) return;
    managerRef.current = new CardManager(sectionRef.current);
    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [isTouchDevice]);

  return (
    <section
      ref={sectionRef}
      className="section-card-grid relative z-[10] translate-z-0"
    >
      <div className="card-grid relative z-[1] overflow-hidden border-t border-[#444] bg-black text-white">
        <div
          ref={wrapperCallbackRef}
          className="card-grid-wrapper relative z-[1]"
        >
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-[#444]" />
      </div>
    </section>
  );
}
