'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types/product';
import { categories } from '@/data/products';
import { uploadProductImage } from '@/lib/upload-product-image';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [popularityScore, setPopularityScore] = useState('0');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = categories.filter((item) => item.value !== 'all');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice((product.price / 100).toString());
      setImageUrl(product.image_url);
      setImagePreview(product.image_url);
      setCategory(product.category);
      setStock(product.stock.toString());
      setIsPopular(Boolean(product.is_popular));
      setPopularityScore(String(product.popularity_score ?? 0));
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setImagePreview('');
      setCategory('');
      setStock('');
      setIsPopular(false);
      setPopularityScore('0');
    }
  }, [product]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploading(true);
    setError(null);

    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
      setImagePreview(url);
    } catch (err) {
      setImageUrl('');
      setImagePreview('');
      setError(err instanceof Error ? err.message : 'Не удалось загрузить фото');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError('Загрузите фото товара');
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Укажите корректную цену');
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setError('Укажите корректное количество на складе');
      return;
    }

    onSubmit({
      id: product?.id || '',
      name,
      description,
      price: Math.round(parsedPrice * 100),
      image_url: imageUrl,
      category,
      stock: parsedStock,
      is_popular: isPopular,
      popularity_score: Math.max(0, parseInt(popularityScore, 10) || 0),
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4">
        {product ? 'Редактировать товар' : 'Добавить новый товар'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Название товара</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Цена (₽)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="productImage">Фото товара</Label>
          <div className="mt-2 space-y-3">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Превью товара"
                className="w-full max-w-xs h-48 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full max-w-xs h-48 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <ImagePlus className="h-10 w-10 text-gray-400" />
              </div>
            )}

            <label
              htmlFor="productImage"
              className={`flex items-center justify-center gap-2 w-full max-w-xs px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                uploading
                  ? 'border-gray-300 bg-gray-50 cursor-wait'
                  : 'border-[#5E4037] bg-[#F9F5F0] hover:bg-[#F3EBE6]'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Загрузка фото...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-5 w-5" />
                  <span>Выбрать фото с телефона или компьютера</span>
                </>
              )}
            </label>

            <input
              id="productImage"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageSelect}
              disabled={uploading}
            />

            <p className="text-xs text-gray-500 max-w-xs">
              На телефоне откроется галерея или камера. Форматы: JPG, PNG, WEBP. До 5 МБ.
            </p>

            <div>
              <Label htmlFor="imageUrl" className="text-sm text-gray-600">
                Или вставьте ссылку на фото
              </Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Категория</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="stock">Количество на складе</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="isPopular"
            checked={isPopular}
            onCheckedChange={(checked) => setIsPopular(checked === true)}
          />
          <Label htmlFor="isPopular">Популярный товар</Label>
        </div>

        <div>
          <Label htmlFor="popularityScore">Рейтинг популярности (чем выше, тем выше в каталоге)</Label>
          <Input
            id="popularityScore"
            type="number"
            min="0"
            value={popularityScore}
            onChange={(e) => setPopularityScore(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={uploading} variant="brand">
            {product ? 'Обновить' : 'Добавить'} товар
          </Button>
        </div>
      </form>
    </div>
  );
}
