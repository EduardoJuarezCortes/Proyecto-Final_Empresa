import faker
import random

fake = faker.Faker("es_MX")


lista = [1, 2, 3, 4, 5]
print(lista)

random.shuffle(lista)
print(lista)