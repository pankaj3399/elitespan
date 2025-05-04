import { useState } from "react";
import HealthOptionCard from "../common/HealthOptionCard";

const options = [
  "Autoimmune",
  "Dentistry",
  "Functional Medicine",
  "Longevity Medicine",
  "Men's Health",
  "Orthopedic",
  "Nutrition",
  "Neurodegenerative Disease",
  "Regenerative Aesthetics",
  "Vision",
  "Women's Health",
];

export default function HealthspanOptions() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const visibleOptions = options.slice(0, 6); // First 6

  return (
    <section className="bg-[#fdf9f6] py-16 px-4 text-center relative">
      <h2 className="text-3xl md:text-4xl font-bold text-[#061140] mb-6">
        Ready to balance your hormones,
        <br />
        discover innovative neurodegenerative therapies,
        <br />
        or find lasting relief for joint pain?
      </h2>
      <p className="text-xl md:text-3xl text-[#061140] leading-relaxed font-extralight">
        Join today to connect with experts, personalizing
        <br />
        your unique needs.
      </p>

      {/* Cards: mobile shows 6, desktop shows all */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center gap-4 max-w-3xl mx-auto mb-6 mt-[40px]">
        {(isDrawerOpen || window.innerWidth >= 768
          ? options
          : visibleOptions
        ).map((option) => (
          <HealthOptionCard key={option} label={option} />
        ))}
      </div>

      {/* See All Button (only on mobile, when drawer is closed) */}
      {!isDrawerOpen && (
        <button
          style={{ fontFamily: "Montserrat" }}
          className="block md:hidden bg-[#0C1F6D] w-full text-white text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition"
          onClick={() => setDrawerOpen(true)}
        >
          See All [Areas]
        </button>
      )}

      {/* Bottom Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-end md:hidden">
          <div className="bg-white w-full max-h-[90vh] rounded-t-2xl p-4 overflow-y-auto">
            {/* Drawer handle */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 active:scale-95 transition cursor-pointer hover:bg-gray-400"
              aria-label="Close drawer"
            />

            {/* All Options inside the Drawer */}
            <div className="flex flex-col gap-4 py-4">
              {options.map((option) => (
                <HealthOptionCard
                  key={option}
                  label={option}
                  variant="drawer"
                />
              ))}
            </div>

            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full mt-4 bg-[#0a0a33] text-white text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
