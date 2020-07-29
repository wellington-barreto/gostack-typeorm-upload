import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enought balance');
    }

    const categoryRepository = getRepository(Category);

    let categoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryExists);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
