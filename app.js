// Loader control
const showLoader = () => {
  document.getElementById("loader").classList.remove("hidden");
};
const hideLoader = () => {
  document.getElementById("loader").classList.add("hidden");
};
let allPets = []; // store all loaded pets
let activeCategory = ""; // track active category
// Load all pets
const loadpets = async () => {
  showLoader();
  const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    const response = await fetch(
      "https://openapi.programming-hero.com/api/peddy/pets"
    );
    const data = await response.json();
    allPets = data.pets;
    displayPets(allPets);
    await Promise.all([minDelay]);
  } catch (error) {
    console.error("error fetching pets :", error);
  } finally {
    hideLoader(); // always hide
  }
};

// Helper: safely return value or placeholder
const safeValue = (value, placeholder = "Not Available") => {
  return value !== null && value !== undefined && value !== ""
    ? value
    : placeholder;
};

const displayPets = (pets) => {
  const container = document.getElementById("pet-container");
  container.innerHTML = "";

  pets.forEach((pet) => {
    const card = document.createElement("div");
    card.className =
      "card bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden";

    card.innerHTML = `
      <img class="m-2" src="${safeValue(
        pet.image,
        "./images/placeholder.png"
      )}" alt="${safeValue(pet.pet_name)}" />
      <div class="p-4">
        <h3 class="font-bold text-lg">${safeValue(pet.pet_name)}</h3>
        <p class="text-sm text-gray-500 flex gap-1">
          <img src="./images/Frame.png" class="w-5 h-5" /> Breed: ${safeValue(
            pet.breed
          )}
        </p>
        <p class="text-sm text-gray-500 flex gap-1">
          <img src="./images/birthicon.png" class="w-6 h-6" /> Birth: ${safeValue(
            pet.date_of_birth
          )}
        </p>
        <p class="text-sm text-gray-500 flex gap-1">
          <img src="./images/gendericon.png" class="w-6 h-6" /> Gender: ${safeValue(
            pet.gender
          )}
        </p>
        <p class="text-sm text-gray-500 flex gap-1">
          <img src="./images/priceicon.png" class="w-6 h-6" /> Price: ${safeValue(
            pet.price,
            "0"
          )}$
        </p>
        <div class="flex gap-3 mt-4">
          <button class="btn text-teal-500 like-btn">
            <img class="text-teal-500" src="./images/likeicon.png" />
          </button>
          <button class="btn text-teal-500 adopt-btn">Adopt</button>
          <button class="btn details-button text-teal-500">Details</button>
        </div>
      </div>
    `;
    const showDetailsModal = (pet) => {
      const modal = document.getElementById("detailsModal");
      const modalContent = document.getElementById("modalContent");

      modalContent.innerHTML = `
    <img src="${safeValue(
      pet.image,
      "./images/placeholder.png"
    )}" class="w-full rounded-lg mb-4" alt="${safeValue(pet.pet_name)}"/>
    <h2 class="text-xl font-bold mb-2">${safeValue(pet.pet_name)}</h2>
    <p class="text-gray-600 mb-1"><strong>Breed:</strong> ${safeValue(
      pet.breed
    )}</p>
    <p class="text-gray-600 mb-1"><strong>Birth:</strong> ${safeValue(
      pet.date_of_birth
    )}</p>
    <p class="text-gray-600 mb-1"><strong>Gender:</strong> ${safeValue(
      pet.gender
    )}</p>
    <p class="text-gray-600 mb-1"><strong>Price:</strong> ${safeValue(
      pet.price,
      "0"
    )}$</p>
    <h2 class="text-xl font-bold mb-2 mt-5">Pet Details</h2>
    <p class="text-gray-500 mt-2">${safeValue(
      pet.pet_details,
      "No additional information available."
    )}</p>
    <button id="cancelModalBtn" class="btn w-full mt-2 bg-teal-600 text-white rounded-lg hover:bg-gray-300">Cancle</button>
  `;

      modal.classList.remove("hidden");
      const cancelBtn = modalContent.querySelector("#cancelModalBtn");
      cancelBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });

      const closeModalBtn = modal.querySelector("#closeModal");
      closeModalBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    };
    const detailsBtn = card.querySelector(".details-button");
    detailsBtn.addEventListener("click", () => {
      showDetailsModal(pet);
    });

    // ✅ Like button
    const likeBtn = card.querySelector(".like-btn");
    likeBtn.addEventListener("click", () => {
      addToAdopted(pet.image, pet.pet_name);
    });
    const adoptBtn = card.querySelector(".adopt-btn");
    adoptBtn.addEventListener("click", () => {
      let count = 3;
      adoptBtn.disabled = true; // prevent multiple clicks
      const countdown = setInterval(() => {
        adoptBtn.textContent = count;
        count--;

        if (count < 0) {
          clearInterval(countdown);
          adoptBtn.textContent = "Adopted";
          adoptBtn.classList.add(
            "bg-gray-400",
            "text-white",
            "cursor-not-allowed"
          );
        }
      }, 1000);
    });

    adoptBtn.addEventListener("click", () => {
      // open modal
      const modal = document.getElementById("detailsModal");
      const modalContent = document.getElementById("modalContent");

      let count = 3;
      modalContent.innerHTML = `
    <div class="flex flex-col items-center justify-center py-10">
      <h2 class="text-2xl font-bold text-teal-600">Adopting...</h2>
      <p id="countdownText" class="text-2xl mt-4 font-bold">${count}</p>
    </div>
  `;
      modal.classList.remove("hidden");

      const countdownText = document.getElementById("countdownText");

      const countdown = setInterval(() => {
        count--;
        countdownText.textContent = count;

        if (count < 0) {
          clearInterval(countdown);

          // Close modal after countdown
          modal.classList.add("hidden");

          // Update button → Adopted
          adoptBtn.textContent = "Adopted";
          adoptBtn.disabled = true;
          adoptBtn.classList.add(
            "bg-gray-400",
            "text-white",
            "cursor-not-allowed"
          );
        }
      }, 1000);
    });

    container.appendChild(card);
  });
};

// Load categories
const loadCategories = async () => {
  try {
    const res = await fetch(
      "https://openapi.programming-hero.com/api/peddy/categories"
    );
    const data = await res.json();
    displayCategories(data.categories);
  } catch (err) {
    console.error("Error loading categories:", err);
  }
};

// Display categories
const displayCategories = (categories) => {
  const container = document.getElementById("category-container");
  container.innerHTML = "";

  // Add flex wrap for mobile responsiveness
  container.className =
    "w-full py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center";

  categories.forEach((cata) => {
    const btn = document.createElement("button");
    btn.style.padding = "16px";
    btn.className = `
        btn 
      border 
      rounded-2xl 
      flex 
      items-center 
      justify-center
      gap-2 
      category-btn 
      text-sm sm:text-base
      w-full
  
  
    `;
    btn.setAttribute("data-category", cata.category);
    btn.innerHTML = `
      <img src="${cata.category_icon}" alt="${cata.category}" class=" sm:w-10 h-15 sm:h-10 m-4" />
      ${cata.category}s
    `;
    container.appendChild(btn);
  });

  // Bind click events
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");
      loadPetsByCategory(category);
    });
  });
};

// Load pets by category
const loadPetsByCategory = async (category) => {
  showLoader();
  activeCategory = category;
  const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const response = await fetch(
      `https://openapi.programming-hero.com/api/peddy/category/${category.toLowerCase()}`
    );

    if (!response.ok) {
      await minDelay;
      displayNoData(category);
      return;
    }

    const data = await response.json();
    await minDelay;

    if (!data.data || data.data.length === 0) {
      displayNoData(category);
    } else {
      // displayPets(data.data);
      allPets = data.data; // update global list with category pets
      displayPets(allPets);
    }
  } catch (error) {
    console.error("Error fetching pets by category:", error);
    displayNoData(category);
  } finally {
    hideLoader();
  }
};

// No Data message
const displayNoData = (category) => {
  const container = document.getElementById("pet-container");
  container.innerHTML = `
    <div class="card col-span-full shadow-md bg-gray-300 flex flex-col items-center justify-center py-20">
      <img src="./images/search.png" class="w-32 h-32 mb-6 item-center justify-center" />
      <h3 class="text-gray-700 font-bold text-xl mb-2">No ${category} Pets Available</h3>
      <p class="text-gray-500 text-center max-w-sm">
        It is a long established fact that a reader will be distracted by the readable content
        of a page when looking at its layout.
      </p>
    </div>
  `;
};

const addToAdopted = (image, name) => {
  const addToContainer = document.getElementById("adopt-container");
  addToContainer.innerHTML += `
   <img src="${image}" alt="${name}" class="rounded-lg shadow" />
  `;
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  loadpets();
  const sortBtn = document.getElementById("sortBtn");
  sortBtn.addEventListener("click", () => {
    if (allPets.length === 0) return;

    // Sort descending by price
    const sorted = [...allPets].sort((a, b) => (b.price || 0) - (a.price || 0));
    displayPets(sorted);
  });
});
