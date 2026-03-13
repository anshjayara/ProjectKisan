import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
import os
from PIL import Image

# Custom dataset wrapper to handle filtered classes
class FilteredImageDataset(torch.utils.data.Dataset):
    def __init__(self, dataset, valid_indices, exclude_label):
        self.dataset = dataset
        self.valid_indices = valid_indices
        self.exclude_label = exclude_label
        
        # Create label mapping (old label -> new label)
        self.label_mapping = {}
        new_label = 0
        for old_label in range(len(dataset.classes)):
            if old_label != exclude_label:
                self.label_mapping[old_label] = new_label
                new_label += 1
    
    def __len__(self):
        return len(self.valid_indices)
    
    def __getitem__(self, idx):
        actual_idx = self.valid_indices[idx]
        image, old_label = self.dataset[actual_idx]
        new_label = self.label_mapping[old_label]
        return image, new_label

# Pre-validate dataset: only keep readable images
def validate_dataset_images(dataset, valid_indices, sample_check=False):
    """Filter to only valid readable images"""
    import os
    from PIL import Image as PILImage
    
    print("Validating dataset images...")
    valid_paths = []
    
    for i, idx in enumerate(valid_indices):
        if i % 2000 == 0:
            print(f"Validated {i}/{len(valid_indices)} images...")
        
        img_path, _ = dataset.samples[idx]
        try:
            # Quick check: file exists and is readable
            if os.path.exists(img_path):
                # Try to open as image
                with PILImage.open(img_path) as img:
                    img.verify()
                valid_paths.append(idx)
        except:
            pass
    
    print(f"Found {len(valid_paths)}/{len(valid_indices)} valid images")
    return valid_paths

# dataset path - adjusted for actual location
data_dir = "../Dataset of diseased plant leaf images and corresponding labels/PlantVillage"

# Check if dataset exists
if not os.path.exists(data_dir):
    print(f"Error: Dataset not found at {data_dir}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Available folders: {os.listdir('..')}")
    exit(1)

# List subdirectories to verify structure
print(f"Dataset path: {data_dir}")
print(f"Subdirectories found: {os.listdir(data_dir)[:5]}...")  # Show first 5

# image transformations
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])

# Filter out 'PlantVillage' folder from classes (it's a duplicate nested folder)
def is_valid_class(class_name):
    return class_name != 'PlantVillage'

# load dataset
raw_dataset = datasets.ImageFolder(data_dir, transform=transform)

# Get PlantVillage index
plantvillage_idx = None
for idx, name in enumerate(raw_dataset.classes):
    if name == 'PlantVillage':
        plantvillage_idx = idx
        break

# Filter samples to only include valid classes
valid_indices = [i for i, (_, label) in enumerate(raw_dataset.samples) if label != plantvillage_idx]

# Pre-validate images to remove corrupted files
valid_indices = validate_dataset_images(raw_dataset, valid_indices)

# Wrap with FilteredImageDataset to remap labels
dataset = FilteredImageDataset(raw_dataset, valid_indices, plantvillage_idx)

# Create a proper classes list for display
valid_classes = [c for c in raw_dataset.classes if c != 'PlantVillage']

print("Classes:", valid_classes)
print("Total images:", len(dataset))
print(f"Number of classes: {len(valid_classes)}")

# split dataset
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=0)
val_loader = DataLoader(val_dataset, batch_size=64, num_workers=0)

# load pretrained model
print("Loading MobileNetV2 model...")
model = models.mobilenet_v2(weights='DEFAULT')
print("Model loaded successfully!")

# modify final layer - use len(valid_classes) instead
print("Modifying final layer...")
num_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_features, len(valid_classes))
print("Model modified!")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")
print("Moving model to device...")
model = model.to(device)
print("Model ready on device!")

# loss + optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# training loop
epochs = 1

print("Starting training loop...")
for epoch in range(epochs):
    
    model.train()
    running_loss = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    print(f"Epoch {epoch+1}/{epochs} Loss: {running_loss:.4f}")

print("Training Finished")

# ensure models directory exists
os.makedirs("../models", exist_ok=True)

# save model
torch.save(model.state_dict(), "../models/crop_disease_model.pth")

print("Model saved successfully at ../models/crop_disease_model.pth!")
