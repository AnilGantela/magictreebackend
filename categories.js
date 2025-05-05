const categories = {
  Industrial: [],
  "Security & Safety": ["Biometrics", "CCTV Surveillance"],
  "Eco Friendly": ["Bags", "Chappals", "Clothes"],
  "HR Consultancy": [
    "Internships/Summer Projects",
    "Man Power Planning",
    "Training",
    "Appraisal Systems",
    "Recruitment/Placements",
  ],
  Marketing: [
    "Market Research",
    "Product Selling/Buying",
    "Advertising",
    "Product Design",
    "Product Pricing",
  ],
};

const categoryValues = Object.keys(categories);
const subcategoryValues = Object.values(categories).flat();

module.exports = { categories, categoryValues, subcategoryValues };
