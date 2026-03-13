from pathlib import Path
import re

import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image, UnidentifiedImageError
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, models, transforms


ROOT_DIR = Path(__file__).resolve().parent.parent
DATASET_ROOT = ROOT_DIR / "Pest Detection"
MODEL_OUTPUT = ROOT_DIR / "models" / "pest_model.pth"
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def normalize_class_name(name):
    normalized = name.lower().strip()
    normalized = normalized.replace("_train", "").replace("_test", "")
    normalized = normalized.replace(" ", "")
    normalized = normalized.replace("_", "")
    normalized = re.sub(r"[^a-z0-9]", "", normalized)
    replacements = {
        "stemborder": "stemborer",
    }
    return replacements.get(normalized, normalized)


def resolve_dataset_dirs():
    direct_train = DATASET_ROOT / "train"
    direct_test = DATASET_ROOT / "test"
    nested_train = DATASET_ROOT / "Pest Detection" / "train"
    nested_test = DATASET_ROOT / "Pest Detection" / "test"

    if direct_train.exists() and direct_test.exists():
        return direct_train, direct_test

    if nested_train.exists() and nested_test.exists():
        return nested_train, nested_test

    raise FileNotFoundError(
        "Pest dataset not found. Expected either 'Pest Detection/train' and 'Pest Detection/test' "
        "or 'Pest Detection/Pest Detection/train' and 'Pest Detection/Pest Detection/test'."
    )


class RemappedImageFolder(Dataset):
    def __init__(self, root, transform, class_to_idx):
        self.dataset = datasets.ImageFolder(root, transform=transform)
        self.class_to_idx = class_to_idx
        self.samples = []

        print(f"Validating images in {root}...")
        for image_path, original_label in self.dataset.samples:
            raw_class_name = self.dataset.classes[original_label]
            normalized_class = normalize_class_name(raw_class_name)

            if normalized_class not in class_to_idx:
                continue

            image_suffix = Path(image_path).suffix.lower()
            if image_suffix not in VALID_EXTENSIONS:
                continue

            try:
                with Image.open(image_path) as image:
                    image.verify()
            except (FileNotFoundError, UnidentifiedImageError, OSError, ValueError):
                continue

            self.samples.append((image_path, class_to_idx[normalized_class]))

        self.classes = [name for name, _ in sorted(class_to_idx.items(), key=lambda item: item[1])]

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        image_path, label = self.samples[index]
        sample = self.dataset.loader(image_path)

        if self.dataset.transform is not None:
            sample = self.dataset.transform(sample)

        return sample, label


def main():
    train_dir, test_dir = resolve_dataset_dirs()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])

    train_base = datasets.ImageFolder(train_dir)
    test_base = datasets.ImageFolder(test_dir)

    normalized_classes = sorted(
        {
            normalize_class_name(name)
            for name in train_base.classes + test_base.classes
        }
    )
    class_to_idx = {class_name: index for index, class_name in enumerate(normalized_classes)}

    train_dataset = RemappedImageFolder(train_dir, transform=transform, class_to_idx=class_to_idx)
    test_dataset = RemappedImageFolder(test_dir, transform=transform, class_to_idx=class_to_idx)

    if len(train_dataset) == 0:
        raise ValueError("No valid training images found after dataset validation.")

    if len(test_dataset) == 0:
        raise ValueError("No valid test images found after dataset validation.")

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=32, num_workers=0)

    print("Classes:", train_dataset.classes)
    print(f"Training images: {len(train_dataset)}")
    print(f"Test images: {len(test_dataset)}")

    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)

    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_features, len(train_dataset.classes))

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    epochs = 5

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        print(f"Epoch {epoch + 1}/{epochs} Loss: {running_loss:.4f}")

    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            predictions = outputs.argmax(dim=1)
            total += labels.size(0)
            correct += (predictions == labels).sum().item()

    accuracy = 100 * correct / total if total else 0
    print(f"Test Accuracy: {accuracy:.2f}%")

    MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), MODEL_OUTPUT)
    print(f"Model saved at {MODEL_OUTPUT}")


if __name__ == "__main__":
    main()
