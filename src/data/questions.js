export const questionsData = [
  // SECTION 1: Single Choice (+3 / -1) -> Q1 to Q4
  {
    id: 1,
    section: 1,
    sectionName: "Section 1: Single Choice Correct",
    type: "single",
    marks: { correct: 3, incorrect: -1 },
    question: "A block of mass $m = 2\\text{ kg}$ is pulled along a rough horizontal surface $(\\mu = 0.2)$ by a constant force $F = 10\\text{ N}$ inclined at an angle $\\theta = 37^\\circ$ to the horizontal. The work done by the normal force during a displacement of $s = 5\\text{ m}$ is:",
    options: [
      "A) $20\\text{ J}$",
      "B) $0\\text{ J}$",
      "C) $-10\\text{ J}$",
      "D) $50\\text{ J}$"
    ],
    correctAnswer: 1, // B
    solution: "Since normal force is perpendicular to horizontal displacement, $\\theta = 90^\\circ$, hence $W = F N \\cos(90^\\circ) = 0\\text{ J}$."
  },
  // ... baki saare questions ...
];