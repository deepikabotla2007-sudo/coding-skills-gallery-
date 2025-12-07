#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct node {
    char name[50];
    struct node *next;
    struct node *prev;
};

struct node *head = NULL;
struct node *tail = NULL;
struct node *current = NULL;

struct node* createNode(char img[]) {
    struct node * newNode = (struct node *)malloc(sizeof(struct node));
    strcpy(newNode->name, img);
    newNode->next = NULL;
    newNode->prev = NULL;
    return newNode;
}

// Insert at the end
void insertPhoto(char img[]) {
    struct node *newNode = createNode(img);

    if (head == NULL) {
        head = tail = current = newNode;
    } else {
        tail->next = newNode;
        newNode->prev = tail;
        tail = newNode;
    }

    printf("Photo '%s' added.\n", img);
}

// Delete by name
void deletePhoto(char img[]) {
    struct node *temp = head;

    while (temp != NULL && strcmp(temp->name, img) != 0)
        temp = temp->next;

    if (temp == NULL) {
        printf("Photo '%s' not found!\n", img);
        return;
    }

    if (temp->prev) temp->prev->next = temp->next;
    if (temp->next) temp->next->prev = temp->prev;

    if (temp == head) head = temp->next;
    if (temp == tail) tail = temp->prev;

    if (current == temp) current = temp->next ? temp->next : head;

    free(temp);
    printf("Photo '%s' deleted.\n", img);
}

// Display all photos
void displayGallery() {
    if (head == NULL) {
        printf("Gallery Empty!\n");
        return;
    }

    struct node *temp = head;
    printf("\nPhoto Gallery:\n");
    while (temp != NULL) {
        printf("[%s] <-> ", temp->name);
        temp = temp->next;
    }
    printf("NULL\n");
}

// View Next Photo
void nextPhoto() {
    if (current == NULL) {
        printf("Gallery Empty!\n");
        return;
    }
    if (current->next != NULL)
        current = current->next;
    printf("Now Viewing: %s\n", current->name);
}

// View Previous Photo
void prevPhoto() {
    if (current == NULL) {
        printf("Gallery Empty!\n");
        return;
    }
    if (current->prev != NULL)
        current = current->prev;
    printf("Now Viewing: %s\n", current->name);
}

int main() {
    int choice;
    char img[50];

    while (1) {
        printf("\n=== PHOTO GALLERY MENU ===\n");
        printf("1. Insert Photo\n");
        printf("2. Delete Photo\n");
        printf("3. Display Gallery\n");
        printf("4. Next Photo\n");
        printf("5. Previous Photo\n");
        printf("6. Exit\n");
        printf("Enter choice: ");
        scanf("%d", &choice);
        getchar(); // consume newline

        switch (choice) {
            case 1:
                printf("Enter Photo Name: ");
                fgets(img, sizeof(img), stdin);
                img[strcspn(img, "\n")] = 0; // remove newline
                insertPhoto(img);
                break;
            case 2:
                printf("Enter Photo Name to Delete: ");
                fgets(img, sizeof(img), stdin);
                img[strcspn(img, "\n")] = 0;
                deletePhoto(img);
                break;
            case 3:
                displayGallery();
                break;
            case 4:
                nextPhoto();
                break;
            case 5:
                prevPhoto();
                break;
            case 6:
                printf("Exiting...\n");
                exit(0);
            default:
                printf("Invalid Option!\n");
        }
    }
 return 0;
}
