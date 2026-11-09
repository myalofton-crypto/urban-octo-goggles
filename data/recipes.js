/*
 * Recipe library for the prototype.
 *
 * Each recipe is plain data, so swapping in your own content means editing
 * this file only. Field guide:
 *   baseServings  number the quantities below are written for
 *   ingredients   qty (number or null), unit, item, allergens[], diet[] flags
 *                 the ingredient conflicts with, and an optional swap
 *   steps         text, optional timer (seconds), optional video (URL or
 *                 null for the placeholder panel), and tips keyed by skill
 *                 level: beginner, intermediate, confident, plus "all"
 *
 * Allergen keys: dairy, eggs, gluten, nuts, shellfish, soy, fish
 * Diet keys:     vegetarian, vegan, gluten-free, dairy-free
 */
window.RECIPES = [
  {
    id: "black-bean-tacos",
    title: "Smoky Black Bean Tacos",
    summary: "A weeknight favorite with crisp-edged beans, quick-pickled onions, and lime crema.",
    time: 30,
    difficulty: "Easy",
    baseServings: 4,
    tags: ["vegetarian", "weeknight"],
    ingredients: [
      { qty: 2, unit: "cans", item: "black beans, drained and rinsed" },
      { qty: 1, unit: "", item: "red onion, thinly sliced" },
      { qty: 0.5, unit: "cup", item: "lime juice, divided" },
      { qty: 1, unit: "tbsp", item: "olive oil" },
      { qty: 2, unit: "tsp", item: "smoked paprika" },
      { qty: 1, unit: "tsp", item: "ground cumin" },
      { qty: 0.5, unit: "cup", item: "sour cream", allergens: ["dairy"], diet: ["vegan", "dairy-free"], swap: "unsweetened plant yogurt" },
      { qty: 8, unit: "", item: "corn tortillas" },
      { qty: 0.5, unit: "cup", item: "crumbled cotija", allergens: ["dairy"], diet: ["vegan", "dairy-free"], swap: "toasted pepitas" },
      { qty: null, unit: "", item: "cilantro and salt, to taste" }
    ],
    steps: [
      {
        text: "Toss the sliced onion with half the lime juice and a pinch of salt. Set it aside to quick-pickle while you cook.",
        video: null,
        tips: {
          beginner: "Slice the onion as thin as you can. Thinner slices pickle faster and taste milder.",
          confident: "Add a splash of the pickling liquid to the crema later for a brighter finish."
        }
      },
      {
        text: "Heat the olive oil in a large skillet over medium-high heat. Add the beans, paprika, and cumin.",
        video: null,
        tips: {
          beginner: "The oil is ready when it shimmers. If it smokes, pull the pan off the heat for a moment.",
          all: "Pat the beans dry first. Dry beans crisp; wet beans steam."
        }
      },
      {
        text: "Cook the beans without stirring for four minutes, until the bottoms crisp. Then stir and lightly mash about a third of them.",
        timer: 240,
        video: null,
        tips: {
          beginner: "Resist the urge to stir. Patience gives you the crispy edges.",
          intermediate: "Mashing part of the beans gives the filling body so it stays in the tortilla."
        }
      },
      {
        text: "Whisk the sour cream with the remaining lime juice and a pinch of salt to make the crema.",
        video: null,
        tips: { all: "Thin the crema with a teaspoon of water if you want it to drizzle." }
      },
      {
        text: "Warm the tortillas in a dry pan for about thirty seconds per side, then wrap them in a towel to keep them soft.",
        timer: 60,
        video: null,
        tips: {
          beginner: "A little char is a good sign. Stack and wrap them as you go.",
          confident: "Hold each tortilla over a gas flame with tongs for a few seconds for smoky blistering."
        }
      },
      {
        text: "Fill each tortilla with beans, pickled onion, crema, cotija, and cilantro. Serve right away.",
        video: null,
        tips: { all: "Set everything out and let guests build their own. Hosting gets easier when the table does the work." }
      }
    ]
  },
  {
    id: "lemon-garlic-salmon",
    title: "One-Pan Lemon Garlic Salmon",
    summary: "Tender salmon and roasted green beans on a single sheet pan, finished with garlic butter.",
    time: 25,
    difficulty: "Easy",
    baseServings: 2,
    tags: ["gluten-free", "one-pan"],
    ingredients: [
      { qty: 2, unit: "", item: "salmon fillets (6 oz each)", allergens: ["fish"], diet: ["vegetarian", "vegan"] },
      { qty: 8, unit: "oz", item: "green beans, trimmed" },
      { qty: 1, unit: "tbsp", item: "olive oil" },
      { qty: 2, unit: "tbsp", item: "butter, melted", allergens: ["dairy"], diet: ["vegan", "dairy-free"], swap: "more olive oil" },
      { qty: 3, unit: "cloves", item: "garlic, minced" },
      { qty: 1, unit: "", item: "lemon, half juiced and half sliced" },
      { qty: null, unit: "", item: "salt, pepper, and parsley, to taste" }
    ],
    steps: [
      {
        text: "Heat the oven to 400 degrees Fahrenheit and line a sheet pan with parchment.",
        video: null,
        tips: { beginner: "Give the oven a full ten minutes to heat. An under-heated oven gives pale, soggy results." }
      },
      {
        text: "Toss the green beans with olive oil, salt, and pepper. Spread them on one side of the pan and roast for five minutes.",
        timer: 300,
        video: null,
        tips: { all: "Spread the beans in a single layer so they roast instead of steam." }
      },
      {
        text: "Stir together the melted butter, garlic, and lemon juice while the beans roast.",
        video: null,
        tips: { intermediate: "Grate the garlic on a microplane so it melts into the butter." }
      },
      {
        text: "Pat the salmon dry, season it, and set it on the empty side of the pan. Spoon the garlic butter over the top and lay the lemon slices on it.",
        video: null,
        tips: {
          beginner: "Skin side down. The skin protects the fish from overcooking.",
          all: "Dry fish takes seasoning better and browns more evenly."
        }
      },
      {
        text: "Roast for twelve minutes, until the salmon flakes easily with a fork.",
        timer: 720,
        video: null,
        tips: {
          beginner: "Press gently with a fork at the thickest point. If it flakes, it is done.",
          confident: "Pull it at 125 degrees for a silky center; carryover heat finishes the job."
        }
      },
      {
        text: "Finish with parsley and a squeeze of lemon. Serve straight from the pan.",
        video: null,
        tips: { all: "Spoon the pan juices over the beans before serving." }
      }
    ]
  },
  {
    id: "buttermilk-biscuits",
    title: "Sunday Buttermilk Biscuits",
    summary: "Tall, flaky biscuits built on cold butter and a gentle fold.",
    time: 40,
    difficulty: "Medium",
    baseServings: 8,
    tags: ["baking", "vegetarian"],
    ingredients: [
      { qty: 2.5, unit: "cups", item: "all-purpose flour", allergens: ["gluten"], diet: ["gluten-free"], swap: "a 1:1 gluten-free baking blend" },
      { qty: 1, unit: "tbsp", item: "baking powder" },
      { qty: 0.5, unit: "tsp", item: "baking soda" },
      { qty: 1, unit: "tsp", item: "salt" },
      { qty: 0.5, unit: "cup", item: "cold butter, cubed", allergens: ["dairy"], diet: ["vegan", "dairy-free"], swap: "cold vegan butter sticks" },
      { qty: 1, unit: "cup", item: "cold buttermilk", allergens: ["dairy"], diet: ["vegan", "dairy-free"], swap: "oat milk with 1 tbsp lemon juice" },
      { qty: 1, unit: "", item: "egg, beaten, for brushing", allergens: ["eggs"], diet: ["vegan"], swap: "a brush of plant milk" }
    ],
    steps: [
      {
        text: "Heat the oven to 425 degrees Fahrenheit and line a baking sheet with parchment.",
        video: null,
        tips: { all: "A hot oven makes the butter release steam fast, which lifts the layers." }
      },
      {
        text: "Whisk the flour, baking powder, baking soda, and salt in a large bowl.",
        video: null,
        tips: { beginner: "Spoon flour into the cup and level it. Scooping packs it and makes dry biscuits." }
      },
      {
        text: "Cut the cold butter into the flour until the pieces are the size of small peas.",
        video: null,
        tips: {
          beginner: "Work quickly with your fingertips or a pastry cutter. Warm hands melt the butter.",
          confident: "Freeze the butter and grate it straight into the flour for even flakes."
        }
      },
      {
        text: "Pour in the buttermilk and stir just until a shaggy dough forms.",
        video: null,
        tips: { all: "Stop while it still looks a little rough. Overmixing makes tough biscuits." }
      },
      {
        text: "Turn the dough out, pat it into a rectangle, and fold it in thirds like a letter. Repeat the pat and fold three times.",
        video: null,
        tips: {
          beginner: "Flour your hands, not the dough. Too much extra flour dries it out.",
          intermediate: "Each fold stacks the butter into layers. Four folds is the sweet spot."
        }
      },
      {
        text: "Pat the dough one inch thick and cut straight down with a floured cutter. Set the biscuits on the sheet so they touch.",
        video: null,
        tips: { all: "Press straight down without twisting. A twist seals the edges and stops the rise." }
      },
      {
        text: "Brush the tops with egg and bake for fifteen minutes, until tall and golden.",
        timer: 900,
        video: null,
        tips: { beginner: "Peek through the oven window instead of opening the door. Each opening drops the heat." }
      }
    ]
  }
];
