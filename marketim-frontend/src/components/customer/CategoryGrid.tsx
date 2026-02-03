
interface CategoryItem {
  id: string;
  name: string;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: "3", name: "Meyve & Sebze", image: "/categories/cat_fruit.png" },
  { id: "1", name: "Atıştırmalık", image: "/categories/cat_snack.png" },
  { id: "2", name: "Su & İçecek", image: "/categories/cat_drink.png" },
  { id: "4", name: "Süt Ürünleri", image: "/categories/cat_dairy.png" },
  { id: "5", name: "Kahvaltılık", image: "/categories/cat_breakfast.png" },
  { id: "6", name: "Fırından", image: "/categories/cat_bakery.png" },
  { id: "7", name: "Dondurma", image: "/categories/cat_icecream.png" },
  { id: "8", name: "Temel Gıda", image: "/categories/cat_staples.png" },
  { id: "9", name: "Pratik Yemek", image: "/categories/cat_readymeal.png" },
  { id: "10", name: "Et, Tavuk & Balık", image: "/categories/cat_meat.png" },
  { id: "11", name: "Dondurulmuş", image: "/categories/cat_frozen.png" },
  { id: "12", name: "Fit & Form", image: "/categories/cat_fit.png" },
  { id: "13", name: "Kişisel Bakım", image: "/categories/cat_personal.png" },
  { id: "14", name: "Ev Bakım", image: "/categories/cat_homecare.png" },
  { id: "15", name: "Evcil Hayvan", image: "/categories/cat_pet.png" },
  { id: "16", name: "Ev & Yaşam", image: "/categories/cat_homelife.png" },
  { id: "17", name: "Bebek", image: "/categories/cat_baby.png" },
  { id: "18", name: "Cinsel Sağlık", image: "/categories/cat_sexual.png" },
];

interface CategoryGridProps {
  onSelectCategory: (categoryName: string) => void;
}

const CategoryGrid = ({ onSelectCategory }: CategoryGridProps) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6 px-1">Kategoriler</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className="group flex flex-col items-center gap-2 md:gap-3 text-center transition-transform hover:-translate-y-1"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow relative">
               <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300 text-xs">
                  Resim
               </div>
               <img 
                src={cat.image} 
                alt={cat.name} 
                className="relative z-10 w-full h-full object-cover p-2"
                onError={(e) => {
                   (e.target as HTMLImageElement).style.display = 'none';
                }}
               />
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight px-1 break-words w-full">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
